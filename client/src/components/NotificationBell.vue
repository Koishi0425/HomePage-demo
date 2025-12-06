<template>
  <el-dropdown trigger="click">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0">
      <el-icon :size="20"><Bell /></el-icon>
    </el-badge>
    <template #dropdown>
      <el-dropdown-menu class="notification-menu">
        <div class="notification-header">
          <span>通知</span>
          <el-button link size="small" @click.stop="markAllRead">全部已读</el-button>
        </div>
        <el-divider style="margin: 0" />
        <div class="notification-list">
          <div 
            v-for="notif in notifications" 
            :key="notif._id" 
            class="notification-item"
            :class="{ unread: !notif.is_read }"
            @click="handleNotificationClick(notif)"
          >
            <el-avatar :size="40" :src="notif.sender_id.avatar_url" />
            <div class="notif-content">
              <div class="notif-text">
                <strong>{{ notif.sender_id.username }}</strong>
                <span v-if="notif.type === 'like'"> 点赞了你的作品</span>
                <span v-else-if="notif.type === 'comment'"> 评论了你的作品: {{ notif.comment_content }}</span>
                <span v-else-if="notif.type === 'follow'"> 关注了你</span>
              </div>
              <div class="notif-time">{{ formatTime(notif.created_at) }}</div>
            </div>
          </div>
          <div v-if="notifications.length === 0" class="empty-notif">暂无通知</div>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import api from '../api';

const router = useRouter();
const notifications = ref<any[]>([]);
const unreadCount = ref(0);

const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    notifications.value = res.data.data;
    
    const countRes = await api.get('/notifications/unread-count');
    unreadCount.value = countRes.data.data.count;
  } catch (err) {
    console.error(err);
  }
};

const markAllRead = async () => {
  try {
    await api.put('/notifications/read-all');
    unreadCount.value = 0;
    notifications.value.forEach(n => n.is_read = true);
  } catch (err) {
    console.error(err);
  }
};

const handleNotificationClick = async (notif: any) => {
  if (!notif.is_read) {
    await api.put(`/notifications/read/${notif._id}`);
    notif.is_read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
  
  if (notif.type === 'follow') {
    router.push(`/profile/${notif.sender_id._id}`);
  } else if (notif.illustration_id) {
    router.push(`/detail/${notif.illustration_id._id}`);
  }
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
};

onMounted(() => {
  fetchNotifications();
  // 定期刷新通知
  setInterval(fetchNotifications, 30000);
});
</script>

<style scoped>
.notification-menu {
  width: 360px;
  max-height: 500px;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  font-weight: bold;
}
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}
.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.notification-item:hover {
  background: #f5f7fa;
}
.notification-item.unread {
  background: #ecf5ff;
}
.notif-content {
  flex: 1;
  min-width: 0;
}
.notif-text {
  font-size: 14px;
  margin-bottom: 4px;
  word-wrap: break-word;
}
.notif-time {
  font-size: 12px;
  color: #909399;
}
.empty-notif {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>
