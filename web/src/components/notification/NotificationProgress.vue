<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  duration: number
}>()

const running = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      running.value = true
    })
  })
})
</script>

<template>
  <div class="progress" aria-hidden="true">
    <span
      class="progress__line"
      :class="{ 'progress__line--run': running }"
      :style="{ transitionDuration: `${duration}ms` }"
    ></span>
  </div>
</template>

<style scoped>
.progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  overflow: hidden;
}

.progress__line {
  display: block;
  height: 100%;
  width: 100%;
  transform: scaleX(1);
  transform-origin: center;
  transition-property: transform;
  transition-timing-function: linear;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(198, 224, 243, 0.85) 18%,
    rgba(236, 246, 255, 0.98) 50%,
    rgba(198, 224, 243, 0.85) 82%,
    transparent 100%
  );
  box-shadow:
    0 0 10px rgba(170, 208, 236, 0.7),
    0 0 4px rgba(236, 246, 255, 0.55);
}

.progress__line--run {
  transform: scaleX(0);
}
</style>
