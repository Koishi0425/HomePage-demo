<template>
  <div class="property-panel">
    <h3>属性编辑</h3>
    <el-form label-position="top" v-if="component">
      
      <!-- Text Properties -->
      <template v-if="component.type === 'text'">
        <el-form-item label="内容">
          <el-input v-model="component.props.content" type="textarea" />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="component.props.fontSize" :min="12" :max="72" />
        </el-form-item>
        <el-form-item label="对齐">
          <el-radio-group v-model="component.props.textAlign">
            <el-radio-button label="left">左</el-radio-button>
            <el-radio-button label="center">中</el-radio-button>
            <el-radio-button label="right">右</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="component.props.color" />
        </el-form-item>
      </template>

      <!-- Image Properties -->
      <template v-if="component.type === 'image'">
        <el-form-item label="上传方式">
          <el-radio-group v-model="component.props.uploadType">
            <el-radio-button label="url">URL链接</el-radio-button>
            <el-radio-button label="upload">本地上传</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="图片" v-if="component.props.uploadType === 'url'">
          <el-input v-model="component.props.src" placeholder="输入图片URL" />
        </el-form-item>
        
        <el-form-item label="上传图片" v-else>
          <el-upload
            action="/api/illustrations/upload"
            name="image"
            :headers="{ Authorization: `Bearer ${token}` }"
            :on-success="(res) => handleUploadSuccess(res, 'image')"
            :show-file-list="false"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <div v-if="component.props.src" style="margin-top: 10px">
            <img :src="component.props.src" style="max-width: 100px" />
          </div>
        </el-form-item>
        
        <el-form-item label="宽度">
          <el-input v-model="component.props.width" placeholder="e.g. 100% or 300px" />
        </el-form-item>
        <el-form-item label="圆角">
          <el-slider v-model="component.props.borderRadius" :max="100" />
        </el-form-item>
      </template>

      <!-- Video Properties -->
      <template v-if="component.type === 'video'">
        <el-form-item label="上传方式">
          <el-radio-group v-model="component.props.uploadType">
            <el-radio-button label="url">URL链接</el-radio-button>
            <el-radio-button label="upload">本地上传</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="视频" v-if="component.props.uploadType === 'url'">
          <el-input v-model="component.props.src" placeholder="输入视频URL" />
        </el-form-item>
        
        <el-form-item label="上传视频" v-else>
          <el-upload
            action="/api/illustrations/upload"
            name="image"
            :headers="{ Authorization: `Bearer ${token}` }"
            :on-success="(res) => handleUploadSuccess(res, 'video')"
            :show-file-list="false"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <div v-if="component.props.src" style="margin-top: 10px; color: #67c23a">
            已上传
          </div>
        </el-form-item>
        
        <el-form-item label="宽度">
          <el-input v-model="component.props.width" />
        </el-form-item>
      </template>

      <!-- Link Properties -->
      <template v-if="component.type === 'link'">
        <el-form-item label="链接地址">
          <el-input v-model="component.props.href" />
        </el-form-item>
        <el-form-item label="显示文本">
          <el-input v-model="component.props.text" />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="component.props.fontSize" />
        </el-form-item>
      </template>

      <!-- Divider Properties -->
      <template v-if="component.type === 'divider'">
        <el-form-item label="样式">
          <el-select v-model="component.props.borderStyle">
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
            <el-option label="点线" value="dotted" />
          </el-select>
        </el-form-item>
      </template>

      <!-- Row Layout Properties -->
      <template v-if="component.type === 'rowLayout'">
        <el-form-item label="列数">
          <el-input-number 
            :model-value="component.props.columns.length" 
            :min="2" 
            :max="4"
            @change="updateColumns"
          />
        </el-form-item>
        <el-form-item label="间距">
          <el-slider v-model="component.props.gap" :max="50" />
        </el-form-item>
      </template>

      <!-- Column Layout Properties -->
      <template v-if="component.type === 'columnLayout'">
        <el-form-item label="行数">
          <el-input-number 
            :model-value="component.props.rows.length" 
            :min="2" 
            :max="4"
            @change="updateRows"
          />
        </el-form-item>
        <el-form-item label="间距">
          <el-slider v-model="component.props.gap" :max="50" />
        </el-form-item>
      </template>

    </el-form>
    <div v-else class="no-selection">
      请选择一个组件进行编辑
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  component: any;
}>();

const token = computed(() => localStorage.getItem('token'));

const handleUploadSuccess = (res: any, type: 'image' | 'video') => {
  if (props.component && res.data && res.data.image_url) {
    props.component.props.src = res.data.image_url;
  }
};

const updateColumns = (count: number) => {
  if (!props.component) return;
  const current = props.component.props.columns.length;
  if (count > current) {
    for (let i = current; i < count; i++) {
      props.component.props.columns.push({ flex: 1, children: [] });
    }
  } else {
    props.component.props.columns.splice(count);
  }
};

const updateRows = (count: number) => {
  if (!props.component) return;
  const current = props.component.props.rows.length;
  if (count > current) {
    for (let i = current; i < count; i++) {
      props.component.props.rows.push({ flex: 1, children: [] });
    }
  } else {
    props.component.props.rows.splice(count);
  }
};
</script>

<style scoped>
.property-panel {
  padding: 20px;
  background: #fff;
  height: 100%;
  border-left: 1px solid #dcdfe6;
}
.no-selection {
  color: #909399;
  text-align: center;
  margin-top: 50px;
}
</style>
