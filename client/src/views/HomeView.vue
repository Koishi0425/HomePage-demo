<template>
  <div class="home-view">
    <div v-if="searchKeyword" class="search-info">
      搜索 "{{ searchKeyword }}" 的结果 {{ illustrations.length > 0 ? `(${illustrations.length}+ 条)` : '' }}
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="illustrations.length === 0" class="empty">
      {{ searchKeyword ? `未找到与 "${searchKeyword}" 相关的内容` : '暂无插画' }}
    </div>
    
    <div class="waterfall" v-else>
      <div 
        v-for="item in illustrations" 
        :key="item._id" 
        class="card"
        @click="viewDetail(item)"
      >
        <img :src="item.image_url" loading="lazy" />
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="author" @click.stop="goToProfile(item.user_id._id)">
            <el-avatar :size="20" :src="item.user_id.avatar_url" />
            <span>{{ item.user_id.username }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="load-more" v-if="hasMore">
      <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

const route = useRoute();
const router = useRouter();
const illustrations = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const hasMore = ref(true);
const searchKeyword = ref('');

const fetchIllustrations = async (reset = false) => {
  if (reset) {
    page.value = 1;
    illustrations.value = [];
    loading.value = true;
    hasMore.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const keyword = route.query.keyword;
    let endpoint;
    
    if (keyword) {
      endpoint = `/illustrations/search?keyword=${encodeURIComponent(keyword)}&page=${page.value}&limit=20`;
    } else {
      endpoint = `/illustrations?page=${page.value}&limit=20`;
    }
      
    const res = await api.get(endpoint);
    
    if (reset) {
      illustrations.value = res.data.data;
    } else {
      illustrations.value.push(...res.data.data);
    }
    
    if (res.data.data.length < 20) {
      hasMore.value = false;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    page.value++;
    fetchIllustrations();
  }
};

const goToProfile = (userId: string) => {
  router.push(`/profile/${userId}`);
};

const viewDetail = (item: any) => {
  router.push(`/detail/${item._id}`);
};

watch(() => route.query.keyword, (newKeyword) => {
  searchKeyword.value = newKeyword as string || '';
  fetchIllustrations(true);
});

onMounted(() => {
  searchKeyword.value = route.query.keyword as string || '';
  fetchIllustrations(true);
});
</script>

<style scoped>
.home-view {
  padding: 20px;
}
.search-info {
  padding: 10px 0;
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}
.waterfall {
  column-count: 4;
  column-gap: 20px;
}
@media (max-width: 1200px) { .waterfall { column-count: 3; } }
@media (max-width: 900px) { .waterfall { column-count: 2; } }
@media (max-width: 600px) { .waterfall { column-count: 1; } }

.card {
  break-inside: avoid;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
.card img {
  width: 100%;
  display: block;
}
.info {
  padding: 10px;
}
.title {
  font-weight: bold;
  margin-bottom: 5px;
}
.author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
}
.load-more {
  text-align: center;
  margin-top: 20px;
}
.loading, .empty {
  text-align: center;
  padding: 50px;
  color: #909399;
}
</style>
