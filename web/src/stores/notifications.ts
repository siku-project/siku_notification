import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  NotificationDefaults,
  NotificationInput,
  NotificationItem,
  NotificationPosition,
} from '@/utils/notifications'
import {
  DEFAULT_NOTIFICATION_DEFAULTS,
  NOTIFICATION_POSITIONS,
  normalizeNotification,
} from '@/utils/notifications'

export interface NotificationConfigInput {
  maxVisiblePerPosition?: number
  defaultPosition?: NotificationPosition
  defaultDuration?: number
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const queue = ref<NotificationItem[]>([])
  const maxVisiblePerPosition = ref(5)
  const defaults = ref<NotificationDefaults>({ ...DEFAULT_NOTIFICATION_DEFAULTS })
  const timers = new Map<number, ReturnType<typeof setTimeout>>()
  let nextId = 1

  const countActive = (position: NotificationPosition): number =>
    notifications.value.reduce((total, item) => (item.position === position ? total + 1 : total), 0)

  const clearTimer = (id: number): void => {
    const handle = timers.get(id)
    if (handle !== undefined) {
      clearTimeout(handle)
      timers.delete(id)
    }
  }

  const startTimer = (item: NotificationItem): void => {
    if (item.duration <= 0) {
      return
    }
    timers.set(
      item.id,
      window.setTimeout(() => dismiss(item.id), item.duration),
    )
  }

  const mount = (item: NotificationItem): void => {
    notifications.value.push(item)
    startTimer(item)
  }

  const promote = (position: NotificationPosition): void => {
    if (countActive(position) >= maxVisiblePerPosition.value) {
      return
    }
    const index = queue.value.findIndex((item) => item.position === position)
    if (index === -1) {
      return
    }
    const [item] = queue.value.splice(index, 1)
    if (item) {
      mount(item)
    }
  }

  const dismiss = (id: number): void => {
    clearTimer(id)
    const item = notifications.value.find((entry) => entry.id === id)
    if (!item) {
      return
    }
    notifications.value = notifications.value.filter((entry) => entry.id !== id)
    promote(item.position)
  }

  const show = (input: NotificationInput): NotificationItem => {
    const item = normalizeNotification(input, nextId++, Date.now(), defaults.value)
    if (countActive(item.position) < maxVisiblePerPosition.value) {
      mount(item)
    } else {
      queue.value.push(item)
    }
    return item
  }

  const clear = (position?: NotificationPosition): void => {
    const targets = position
      ? notifications.value.filter((item) => item.position === position)
      : [...notifications.value]
    for (const item of targets) {
      clearTimer(item.id)
    }
    if (position) {
      notifications.value = notifications.value.filter((item) => item.position !== position)
      queue.value = queue.value.filter((item) => item.position !== position)
    } else {
      notifications.value = []
      queue.value = []
    }
  }

  const setConfig = (config: NotificationConfigInput): void => {
    if (typeof config.maxVisiblePerPosition === 'number' && config.maxVisiblePerPosition > 0) {
      maxVisiblePerPosition.value = config.maxVisiblePerPosition
    }
    if (config.defaultPosition && NOTIFICATION_POSITIONS.includes(config.defaultPosition)) {
      defaults.value = { ...defaults.value, position: config.defaultPosition }
    }
    if (typeof config.defaultDuration === 'number' && config.defaultDuration >= 0) {
      defaults.value = { ...defaults.value, duration: config.defaultDuration }
    }
  }

  const visibleByPosition = computed<Record<NotificationPosition, NotificationItem[]>>(() => {
    const grouped = Object.fromEntries(
      NOTIFICATION_POSITIONS.map((position) => [position, [] as NotificationItem[]]),
    ) as Record<NotificationPosition, NotificationItem[]>
    for (const item of notifications.value) {
      grouped[item.position]?.push(item)
    }
    return grouped
  })

  return {
    notifications,
    queue,
    maxVisiblePerPosition,
    visibleByPosition,
    show,
    dismiss,
    clear,
    setConfig,
  }
})
