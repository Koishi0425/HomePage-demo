<template>
  <div :style="{ textAlign: 'center' }">
    <video :src="src" controls :style="{ width: width }"></video>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  width?: string;
}>();
</script>
