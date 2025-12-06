<template>
  <div class="profile-view">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!user" class="error">用户不存在</div>
    <div v-else>
      <!-- User Info Header -->
      <div class="profile-header">
        <el-avatar :size="80" :src="user.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        <div class="profile-info">
          <h1>{{ user.username }}</h1>
          <p>{{ user.email }}</p>
          <div class="stats">
            <div class="stat-item">
              <strong>{{ stats.illustrationCount }}</strong>
              <span>作品</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.followingCount }}</strong>
              <span>关注</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.followerCount }}</strong>
              <span>粉丝</span>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <!-- Dynamic Homepage Content -->
      <div class="homepage-content">
        <div v-if="!components || components.length === 0" class="empty-home">
          该用户暂未发布主页
        </div>
        <div v-else class="rendered-components">
          <component 
            v-for="comp in components" 
            :key="comp.id" 
            :is="getComponent(comp.type)" 
            v-bind="comp.props" 
            class="rendered-component"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import {
  TextComponent,
  ImageComponent,
  VideoComponent,
  LinkComponent,
  DividerComponent,
  RowLayoutComponent,
  ColumnLayoutComponent
} from '../components/elements';

const route = useRoute();
const user = ref<any>(null);
const components = ref<any[]>([]);
const stats = ref({ illustrationCount: 0, followingCount: 0, followerCount: 0 });
const loading = ref(true);

const getComponent = (type: string) => {
  const map: any = {
    text: TextComponent,
    image: ImageComponent,
    video: VideoComponent,
    link: LinkComponent,
    divider: DividerComponent,
    rowLayout: RowLayoutComponent,
    columnLayout: ColumnLayoutComponent
  };
  return map[type];
};

const fetchProfile = async () => {
  try {
    const res = await api.get(`/auth/users/${route.params.userId}`);
    user.value = res.data.data.user;
    stats.value = res.data.data.stats || { illustrationCount: 0, followingCount: 0, followerCount: 0 };
    if (res.data.data.homepage && res.data.data.homepage.components) {
      components.value = res.data.data.homepage.components;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #fff;
  min-height: 80vh;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-info h1 {
  margin: 0 0 10px 0;
}
.profile-info p {
  margin: 0;
  color: #666;
}
.stats {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-item strong {
  font-size: 20px;
  color: #303133;
}
.stat-item span {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.rendered-component {
  margin-bottom: 10px;
}
.empty-home {
  text-align: center;
  color: #909399;
  padding: 50px;
}
</style>
