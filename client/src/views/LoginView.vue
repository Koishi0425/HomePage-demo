<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="card-header">
          <span>{{ isLogin ? '登录' : '注册' }}</span>
        </div>
      </template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="邮箱" v-if="!isLogin">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ isLogin ? '登录' : '注册' }}</el-button>
          <el-button link @click="isLogin = !isLogin">{{ isLogin ? '去注册' : '去登录' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import api from '../api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const isLogin = ref(true);
const form = ref({
  username: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await userStore.login({ username: form.value.username, password: form.value.password });
      ElMessage.success('登录成功');
      router.push('/');
    } else {
      await api.post('/auth/register', form.value);
      ElMessage.success('注册成功，请登录');
      isLogin.value = true;
    }
  } catch (err: any) {
    console.error('Authentication error:', err);
    const errorData = err.response?.data?.error;
    
    if (Array.isArray(errorData)) {
      // 处理 Zod 验证错误数组
      const msgs = errorData.map((e: any) => e.message).join('; ');
      ElMessage.error(msgs);
    } else {
      // 处理普通错误消息
      ElMessage.error(typeof errorData === 'string' ? errorData : '操作失败，请检查后端服务是否启动');
    }
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
.auth-card {
  width: 400px;
}
</style>
