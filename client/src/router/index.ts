import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import ProfileView from '../views/ProfileView.vue';
import HomeEditor from '../components/HomeEditor.vue';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/profile/:userId', component: ProfileView },
  { 
    path: '/editor', 
    component: HomeEditor,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
