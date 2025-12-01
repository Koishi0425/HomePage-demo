<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo" @click="$router.push('/')">Illustration Platform</div>
        <div class="search-bar">
          <el-input v-model="searchKeyword" placeholder="搜索插画/作者" @keyup.enter="handleSearch">
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="user-actions">
          <template v-if="userStore.token">
            <el-button type="primary" @click="$router.push('/editor')">制作主页</el-button>
            <el-dropdown>
              <span class="el-dropdown-link">
                <el-avatar :size="32" :src="userStore.user?.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push(`/profile/${userStore.user?.id}`)">个人资料</el-dropdown-item>
                  <el-dropdown-item>设置</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="$router.push('/login')">登录</el-button>
          </template>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';

const router = useRouter();
const userStore = useUserStore();
const searchKeyword = ref('');

const handleSearch = () => {
  router.push({ path: '/', query: { keyword: searchKeyword.value } });
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}
.search-bar {
  width: 400px;
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
