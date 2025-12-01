<template>
  <div :style="{ fontSize: fontSize + 'px', textAlign: textAlign, color: color }">
    {{ content }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}>();
</script>
