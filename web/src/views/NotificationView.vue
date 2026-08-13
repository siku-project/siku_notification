<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import NotificationCenter from '@/components/notification/NotificationCenter.vue'
import { useNotificationStore } from '@/stores/notifications'
import type { NotificationConfigInput } from '@/stores/notifications'
import type { NotificationInput } from '@/utils/notifications'
import { sendNuiCallback } from '@/utils/nui'
import { applyLocale } from '@/utils/locale'
import type { LocalePayload } from '@/utils/locale'

const store = useNotificationStore()

interface NotificationNuiMessage {
  action?: string
  notification?: NotificationInput
  config?: NotificationConfigInput
  locale?: LocalePayload
}

const handleMessage = (event: MessageEvent): void => {
  const payload = event.data as NotificationNuiMessage | null
  if (!payload || typeof payload !== 'object') {
    return
  }
  if (payload.action === 'siku:notification:show' && payload.notification) {
    store.show(payload.notification)
  } else if (payload.action === 'siku:notification:hide') {
    store.clear()
  } else if (payload.action === 'siku:notification:setConfig' && payload.config) {
    store.setConfig(payload.config)
  } else if (payload.action === 'siku:notification:setLocale' && payload.locale) {
    applyLocale(payload.locale)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  sendNuiCallback('siku:callback:ready')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<template>
  <NotificationCenter />
</template>
