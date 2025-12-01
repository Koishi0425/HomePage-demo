<template>
  <div :style="{ textAlign: 'center' }">
    <img :src="src" :style="{ width: width, borderRadius: borderRadius + 'px' }" alt="User Image" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  width?: string;
  borderRadius?: number;
}>();
</script>
