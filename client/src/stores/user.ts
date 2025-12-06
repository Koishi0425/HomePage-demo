import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    token.value = res.data.data.token;
    user.value = res.data.data.user;
    localStorage.setItem('token', token.value!);
    localStorage.setItem('user', JSON.stringify(user.value));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const loadUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  };

  // 初始化时加载用户信息
  if (token.value && !user.value) {
    loadUser();
  }

  return { user, token, login, logout, loadUser };
});
