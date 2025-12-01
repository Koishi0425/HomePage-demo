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
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  };

  return { user, token, login, logout };
});
