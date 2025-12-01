<template>
  <el-divider :border-style="borderStyle" />
</template>

<script setup lang="ts">
defineProps<{
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}>();
</script>
