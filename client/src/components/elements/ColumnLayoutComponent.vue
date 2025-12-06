<template>
  <div class="column-layout" :style="{ gap: gap + 'px', display: 'flex', flexDirection: 'column' }">
    <div 
      v-for="(row, index) in rows" 
      :key="index" 
      class="column-row"
      :style="{ flex: row.flex || 1 }"
    >
      <draggable
        v-model="row.children"
        group="components"
        item-key="id"
        class="drop-zone"
      >
        <template #item="{ element }">
          <div v-if="element && element.id" class="nested-item">
            <component :is="getComponent(element.type)" v-bind="element.props" />
          </div>
        </template>
      </draggable>
      <div v-if="!row.children || row.children.length === 0" class="empty-hint">
        拖入组件
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import draggable from 'vuedraggable';
import TextComponent from './TextComponent.vue';
import ImageComponent from './ImageComponent.vue';
import VideoComponent from './VideoComponent.vue';
import LinkComponent from './LinkComponent.vue';
import DividerComponent from './DividerComponent.vue';

interface Row {
  flex?: number;
  children: any[];
}

interface Props {
  rows?: Row[];
  gap?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [{ flex: 1, children: [] }, { flex: 1, children: [] }],
  gap: 10
});

// 确保 rows 是响应式的
if (props.rows) {
  props.rows.forEach(row => {
    if (!row.children) row.children = [];
  });
}

const getComponent = (type: string) => {
  const map: any = {
    text: TextComponent,
    image: ImageComponent,
    video: VideoComponent,
    link: LinkComponent,
    divider: DividerComponent
  };
  return map[type] || null;
};
</script>

<style scoped>
.column-layout {
  width: 100%;
  min-height: 120px;
  padding: 5px;
}
.column-row {
  background-color: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  padding: 10px;
  min-height: 60px;
}
.drop-zone {
  min-height: 40px;
}
.empty-hint {
  color: #999;
  text-align: center;
  padding: 20px;
  font-size: 12px;
}
.nested-item {
  margin-bottom: 10px;
}
.nested-item:last-child {
  margin-bottom: 0;
}
</style>
