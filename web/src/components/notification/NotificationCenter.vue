<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'
import { NOTIFICATION_POSITIONS } from '@/utils/notifications'
import type { NotificationItem, NotificationPosition } from '@/utils/notifications'
import NotificationCard from './NotificationCard.vue'

const store = useNotificationStore()
const { visibleByPosition } = storeToRefs(store)

const displayItems = (position: NotificationPosition): NotificationItem[] => {
  const items = visibleByPosition.value[position] ?? []
  return position.startsWith('bottom') ? items : [...items].reverse()
}
</script>

<template>
  <div class="center">
    <TransitionGroup
      v-for="position in NOTIFICATION_POSITIONS"
      :key="position"
      tag="div"
      name="notif"
      class="stack"
      :class="`pos-${position}`"
    >
      <NotificationCard
        v-for="item in displayItems(position)"
        :key="item.id"
        :notification="item"
        class="stack__item"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.center {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}

.stack {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 92vw;
}

.stack__item {
  pointer-events: auto;
  will-change: transform, opacity;
}

.pos-top-left {
  top: 2.5rem;
  left: 2.5rem;
  align-items: flex-start;
}

.pos-top-center {
  top: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.pos-top-right {
  top: 2.5rem;
  right: 2.5rem;
  align-items: flex-end;
}

.pos-center-left {
  top: 50%;
  left: 2.5rem;
  transform: translateY(-50%);
  align-items: flex-start;
}

.pos-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
}

.pos-center-right {
  top: 50%;
  right: 2.5rem;
  transform: translateY(-50%);
  align-items: flex-end;
}

.pos-bottom-left {
  bottom: 2.5rem;
  left: 2.5rem;
  align-items: flex-start;
}

.pos-bottom-center {
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.pos-bottom-right {
  bottom: 2.5rem;
  right: 2.5rem;
  align-items: flex-end;
}

.notif-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.notif-leave-active {
  position: absolute;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.notif-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.notif-enter-from,
.notif-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
