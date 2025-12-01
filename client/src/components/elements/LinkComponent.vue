<template>
  <div :style="{ textAlign: textAlign }">
    <a :href="href" target="_blank" :style="{ color: color, fontSize: fontSize + 'px' }">{{ text }}</a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  href: string;
  text: string;
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}>();
</script>
