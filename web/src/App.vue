<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import NotificationView from './views/NotificationView.vue'

const BoilerplateView = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./views/BoilerplateView.vue'))
  : null
</script>

<template>
  <VApp>
    <component :is="BoilerplateView" v-if="BoilerplateView" />
    <NotificationView v-else />
  </VApp>
</template>
