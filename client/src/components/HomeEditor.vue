<template>
  <div class="editor-container">
    <!-- Left: Component Library -->
    <div class="component-library">
      <h3>组件库</h3>
      <draggable
        class="drag-area"
        :list="componentTypes"
        :group="{ name: 'components', pull: 'clone', put: false }"
        :clone="cloneComponent"
        item-key="type"
      >
        <template #item="{ element }">
          <div class="library-item">
            {{ element.label }}
          </div>
        </template>
      </draggable>

      <h3>模板</h3>
      <div class="template-list">
        <div 
          v-for="tpl in templates" 
          :key="tpl._id" 
          class="template-item"
          @click="applyTemplate(tpl)"
        >
          {{ tpl.name }}
        </div>
      </div>
    </div>

    <!-- Center: Canvas -->
    <div class="canvas-container">
      <div class="canvas-header">
        <el-button type="primary" @click="saveHomepage">保存草稿</el-button>
        <el-button type="success" @click="publishHomepage">发布主页</el-button>
      </div>
      <div class="canvas">
        <draggable
          class="drag-area-canvas"
          v-model="canvasComponents"
          group="components"
          item-key="id"
          @change="handleCanvasChange"
        >
          <template #item="{ element }">
            <div 
              class="canvas-component-wrapper" 
              :class="{ active: selectedId === element.id }"
              @click.stop="selectedId = element.id"
            >
              <div class="component-actions" v-if="selectedId === element.id">
                <el-button type="danger" size="small" circle icon="Delete" @click.stop="removeComponent(element.id)">x</el-button>
              </div>
              <component :is="getComponent(element.type)" v-bind="element.props" />
            </div>
          </template>
        </draggable>
        <div v-if="canvasComponents.length === 0" class="empty-canvas">
          从左侧拖拽组件到此处
        </div>
      </div>
    </div>

    <!-- Right: Property Panel -->
    <div class="property-panel-container">
      <PropertyPanel :component="selectedComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../stores/user';
import api from '../api';
import PropertyPanel from './PropertyPanel.vue';
import {
  TextComponent,
  ImageComponent,
  VideoComponent,
  LinkComponent,
  DividerComponent
} from './elements';

const userStore = useUserStore();

// Component Types
const componentTypes = [
  { type: 'text', label: '文本', defaultProps: { content: '请输入文本', fontSize: 16, textAlign: 'left', color: '#000' } },
  { type: 'image', label: '图片', defaultProps: { src: 'https://via.placeholder.com/300', width: '100%', borderRadius: 0 } },
  { type: 'video', label: '视频', defaultProps: { src: '', width: '100%' } },
  { type: 'link', label: '超链接', defaultProps: { href: '#', text: '链接文本', color: '#409EFF', fontSize: 14, textAlign: 'left' } },
  { type: 'divider', label: '分割线', defaultProps: { borderStyle: 'solid' } }
];

const templates = ref<any[]>([]);
const canvasComponents = ref<any[]>([]);
const selectedId = ref<string | null>(null);

const selectedComponent = computed(() => canvasComponents.value.find(c => c.id === selectedId.value));

const getComponent = (type: string) => {
  const map: any = {
    text: TextComponent,
    image: ImageComponent,
    video: VideoComponent,
    link: LinkComponent,
    divider: DividerComponent
  };
  return map[type];
};

const cloneComponent = (origin: any) => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: origin.type,
    props: JSON.parse(JSON.stringify(origin.defaultProps))
  };
};

const handleCanvasChange = () => {
  // Auto-save logic could go here
};

const removeComponent = (id: string) => {
  canvasComponents.value = canvasComponents.value.filter(c => c.id !== id);
  if (selectedId.value === id) selectedId.value = null;
};

const fetchTemplates = async () => {
  try {
    const res = await api.get('/templates');
    templates.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchHomepage = async () => {
  if (!userStore.user) return;
  try {
    const res = await api.get(`/homepage/${userStore.user.id}`);
    if (res.data.data && res.data.data.components_config && res.data.data.components_config.components) {
      canvasComponents.value = res.data.data.components_config.components;
    }
  } catch (err) {
    console.error(err);
  }
};

const applyTemplate = async (tpl: any) => {
  try {
    await ElMessageBox.confirm('应用模板将覆盖当前编辑内容，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // Deep copy to avoid reference issues
    canvasComponents.value = JSON.parse(JSON.stringify(tpl.components_config.components));
    // Regenerate IDs to avoid conflicts if multiple templates are mixed (though here we replace)
    canvasComponents.value.forEach(c => {
      c.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    });
  } catch (e) {
    // Cancelled
  }
};

const saveHomepage = async () => {
  try {
    await api.put('/homepage', {
      components_config: { components: canvasComponents.value }
    });
    ElMessage.success('保存成功');
  } catch (err) {
    ElMessage.error('保存失败');
  }
};

const publishHomepage = async () => {
  try {
    await saveHomepage();
    await api.post('/homepage/publish');
    ElMessage.success('发布成功');
  } catch (err) {
    ElMessage.error('发布失败');
  }
};

onMounted(() => {
  fetchTemplates();
  fetchHomepage();
});
</script>

<style scoped>
.editor-container {
  display: flex;
  height: calc(100vh - 80px);
  background: #f5f7fa;
}

.component-library {
  width: 250px;
  background: #fff;
  padding: 20px;
  border-right: 1px solid #dcdfe6;
  overflow-y: auto;
}

.library-item {
  padding: 10px;
  margin-bottom: 10px;
  background: #ecf5ff;
  border: 1px dashed #409eff;
  cursor: move;
  text-align: center;
  border-radius: 4px;
}

.template-item {
  padding: 10px;
  margin-bottom: 10px;
  background: #f0f9eb;
  border: 1px solid #67c23a;
  cursor: pointer;
  border-radius: 4px;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.canvas-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.canvas {
  flex: 1;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.drag-area-canvas {
  min-height: 100%;
}

.canvas-component-wrapper {
  position: relative;
  border: 2px solid transparent;
  margin-bottom: 5px;
}

.canvas-component-wrapper.active {
  border-color: #409eff;
}

.component-actions {
  position: absolute;
  right: 0;
  top: -15px;
  z-index: 10;
}

.empty-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  pointer-events: none;
}

.property-panel-container {
  width: 300px;
}
</style>
