<template>
  <div class="upload-container">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>上传插画作品</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="作品图片" required>
          <div class="image-uploader" @click="triggerFileInput">
            <img v-if="previewUrl" :src="previewUrl" class="preview-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none" 
              accept="image/*"
              @change="handleFileChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="给作品起个名字吧" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="介绍一下你的创作灵感..." 
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入标签并回车"
            style="width: 100%"
          >
            <el-option label="原创" value="原创" />
            <el-option label="二创" value="二创" />
            <el-option label="风景" value="风景" />
            <el-option label="人物" value="人物" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="uploading">发布作品</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../api';

const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>('');
const uploading = ref(false);
const selectedFile = ref<File | null>(null);

const form = ref({
  title: '',
  description: '',
  tags: [] as string[]
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 5MB');
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择一张图片');
    return;
  }
  if (!form.value.title) {
    ElMessage.warning('请输入标题');
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('tags', JSON.stringify(form.value.tags));

    await api.post('/illustrations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    ElMessage.success('发布成功！');
    router.push('/'); // 返回首页查看
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response?.data?.error || '发布失败');
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}
.upload-card {
  width: 100%;
  max-width: 600px;
}
.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}
.image-uploader:hover {
  border-color: #409eff;
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
