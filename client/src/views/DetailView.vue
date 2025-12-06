<template>
  <div class="detail-view" v-if="illustration">
    <!-- 作品展示区 -->
    <div class="artwork-section">
      <div class="image-container">
        <img :src="illustration.image_url" alt="插画作品" class="artwork-image" />
      </div>
      
      <!-- 右侧信息栏 -->
      <div class="info-panel">
        <!-- 作者信息 -->
        <div class="author-section">
          <div class="author-info" @click="goToProfile(illustration.user_id._id)">
            <el-avatar :size="50" :src="illustration.user_id.avatar_url" />
            <div>
              <div class="author-name">{{ illustration.user_id.username }}</div>
              <div class="publish-time">{{ formatTime(illustration.created_at) }}</div>
            </div>
          </div>
          <el-button 
            v-if="userStore.token && !isOwnWork"
            :type="status.followed ? 'info' : 'primary'" 
            @click="toggleFollow"
          >
            {{ status.followed ? '已关注' : '+ 关注' }}
          </el-button>
        </div>

        <el-divider />

        <!-- 标题和描述 -->
        <div class="content-section">
          <h1>{{ illustration.title }}</h1>
          <p class="description">{{ illustration.description }}</p>
          <div class="tags">
            <el-tag v-for="tag in illustration.tags" :key="tag" size="small">{{ tag }}</el-tag>
          </div>
        </div>

        <el-divider />

        <!-- 互动按钮 -->
        <div class="action-buttons">
          <el-button 
            :type="status.liked ? 'danger' : 'default'" 
            :icon="status.liked ? 'StarFilled' : 'Star'"
            @click="toggleLike"
          >
            {{ status.liked ? '已点赞' : '点赞' }} ({{ illustration.likes_count }})
          </el-button>
          <el-button 
            :type="status.favorited ? 'warning' : 'default'"
            :icon="status.favorited ? 'Star' : 'Star'"
            @click="toggleFavorite"
          >
            {{ status.favorited ? '已收藏' : '收藏' }}
          </el-button>
        </div>

        <el-divider />

        <!-- 评论区 -->
        <div class="comment-section">
          <h3>评论 ({{ comments.length }})</h3>
          
          <div class="comment-input" v-if="userStore.token">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="说点什么..."
            />
            <el-button type="primary" @click="submitComment" style="margin-top: 10px">发表评论</el-button>
          </div>
          <div v-else class="login-tip">
            <el-button link @click="$router.push('/login')">登录后评论</el-button>
          </div>

          <div class="comment-list">
            <div v-for="comment in comments" :key="comment._id" class="comment-item">
              <el-avatar :size="32" :src="comment.user_id.avatar_url" />
              <div class="comment-content">
                <div class="comment-author">{{ comment.user_id.username }}</div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-time">{{ formatTime(comment.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';
import api from '../api';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const illustration = ref<any>(null);
const comments = ref<any[]>([]);
const commentContent = ref('');
const status = ref({ liked: false, favorited: false, followed: false });

// 判断是否为自己的作品
const isOwnWork = computed(() => {
  if (!illustration.value || !userStore.user) return false;
  return String(userStore.user.id) === String(illustration.value.user_id._id);
});

const fetchDetail = async () => {
  try {
    const res = await api.get(`/illustrations/${route.params.id}`);
    illustration.value = res.data.data;
    
    if (userStore.token) {
      const statusRes = await api.get(`/interactions/status/${route.params.id}`);
      status.value = statusRes.data.data;
    }
    
    fetchComments();
  } catch (err) {
    ElMessage.error('加载失败');
  }
};

const fetchComments = async () => {
  try {
    const res = await api.get(`/interactions/comments/${route.params.id}`);
    comments.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const toggleLike = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    if (status.value.liked) {
      await api.delete(`/interactions/like/${route.params.id}`);
      illustration.value.likes_count--;
    } else {
      await api.post('/interactions/like', { illustrationId: route.params.id });
      illustration.value.likes_count++;
    }
    status.value.liked = !status.value.liked;
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
};

const toggleFavorite = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    if (status.value.favorited) {
      await api.delete(`/interactions/favorite/${route.params.id}`);
    } else {
      await api.post('/interactions/favorite', { illustrationId: route.params.id });
    }
    status.value.favorited = !status.value.favorited;
    ElMessage.success(status.value.favorited ? '收藏成功' : '已取消收藏');
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
};

const toggleFollow = async () => {
  try {
    if (status.value.followed) {
      await api.delete(`/interactions/follow/${illustration.value.user_id._id}`);
    } else {
      await api.post('/interactions/follow', { userId: illustration.value.user_id._id });
    }
    status.value.followed = !status.value.followed;
    ElMessage.success(status.value.followed ? '关注成功' : '已取消关注');
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
};

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  
  try {
    const res = await api.post('/interactions/comment', {
      illustrationId: route.params.id,
      content: commentContent.value
    });
    comments.value.unshift(res.data.data);
    commentContent.value = '';
    ElMessage.success('评论成功');
  } catch (err) {
    ElMessage.error('评论失败');
  }
};

const goToProfile = (userId: string) => {
  router.push(`/profile/${userId}`);
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.artwork-section {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}
.image-container {
  flex: 1;
  max-width: 700px;
}
.artwork-image {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.info-panel {
  width: 400px;
  max-height: 800px;
  overflow-y: auto;
}
.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.author-info {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}
.author-name {
  font-weight: bold;
  font-size: 16px;
}
.publish-time {
  color: #909399;
  font-size: 12px;
}
.content-section h1 {
  font-size: 24px;
  margin: 0 0 15px 0;
}
.description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.comment-section {
  margin-top: 20px;
}
.comment-list {
  margin-top: 20px;
}
.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.comment-content {
  flex: 1;
}
.comment-author {
  font-weight: bold;
  margin-bottom: 5px;
}
.comment-text {
  color: #606266;
  margin-bottom: 5px;
}
.comment-time {
  font-size: 12px;
  color: #909399;
}
.login-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>
