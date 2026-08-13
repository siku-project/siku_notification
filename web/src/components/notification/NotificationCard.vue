<script setup lang="ts">
import { computed } from 'vue'
import IcePanel from '@/components/ui/IcePanel.vue'
import NotificationProgress from './NotificationProgress.vue'
import { isInfinite } from '@/utils/notifications'
import type { NotificationItem } from '@/utils/notifications'

const props = defineProps<{
  notification: NotificationItem
}>()

const hasImage = computed(() => Boolean(props.notification.image))
const isBackground = computed(() => props.notification.imageMode === 'background' && hasImage.value)
const isSide = computed(() => props.notification.imageMode === 'side' && hasImage.value)
const infinite = computed(() => isInfinite(props.notification))
const typed = computed(() => props.notification.type !== 'default')

const backgroundStyle = computed(() => ({
  backgroundImage: `url("${props.notification.image}")`,
}))
</script>

<template>
  <div class="card" :class="[`card--${notification.type}`, { 'card--typed': typed }]">
    <IcePanel class="card__panel">
      <div class="card__layers">
        <template v-if="isBackground">
          <div class="card__bg" :style="backgroundStyle"></div>
          <div class="card__overlay"></div>
        </template>

        <div class="card__inner" :class="{ 'card__inner--side': isSide }">
          <div v-if="isSide" class="card__media">
            <img class="card__img" :src="notification.image" alt="" />
          </div>

          <div class="card__content">
            <div v-if="notification.icon || notification.title" class="card__head">
              <v-icon v-if="notification.icon" class="card__icon" size="18">
                {{ notification.icon }}
              </v-icon>
              <p v-if="notification.title" class="card__title">{{ notification.title }}</p>
            </div>

            <p v-if="notification.subtitle" class="card__subtitle">{{ notification.subtitle }}</p>

            <p v-if="notification.description" class="card__description">
              {{ notification.description }}
            </p>
          </div>
        </div>

        <span v-if="typed" class="card__ring" aria-hidden="true"></span>
        <span v-if="notification.type === 'success'" class="card__shine" aria-hidden="true"></span>

        <NotificationProgress v-if="!infinite" :duration="notification.duration" />
      </div>
    </IcePanel>
  </div>
</template>

<style scoped>
.card {
  min-width: 300px;
  max-width: 380px;
}

.card__panel {
  overflow: hidden;
}

.card__layers {
  position: relative;
  height: 100%;
  min-height: 62px;
}

.card__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.card__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(120% 80% at 30% 0%, rgba(233, 244, 253, 0.08) 0%, transparent 55%),
    linear-gradient(180deg, rgba(6, 16, 30, 0.58) 0%, rgba(5, 13, 26, 0.8) 100%);
}

.card__inner {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 62px;
}

.card__inner--side .card__content {
  padding-left: 14px;
}

.card__media {
  flex-shrink: 0;
  align-self: stretch;
  width: 74px;
  overflow: hidden;
  border-right: 1px solid rgba(233, 244, 253, 0.1);
}

.card__img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  display: block;
}

.card__content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 13px 17px;
}

.card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  perspective: 320px;
}

.card__icon {
  color: rgba(198, 224, 243, 0.72);
  flex-shrink: 0;
}

.card__title {
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: rgba(244, 250, 255, 0.96);
  line-height: 1.25;
}

.card__subtitle {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: rgba(198, 224, 243, 0.7);
  line-height: 1.3;
}

.card__description {
  font-size: 12.5px;
  font-weight: 300;
  color: rgba(226, 240, 250, 0.74);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.card--background .card__title,
.card--background .card__subtitle,
.card--background .card__description {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}

.card--background .card__title {
  color: rgba(248, 252, 255, 0.98);
}

.card--background .card__subtitle {
  color: rgba(214, 232, 246, 0.85);
}

.card--background .card__description {
  color: rgba(233, 244, 253, 0.86);
}

.card__ring {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: 1.2rem;
  border: 1px solid rgba(var(--accent), 0.5);
  box-shadow:
    0 0 12px rgba(var(--accent), 0.32),
    inset 0 0 10px rgba(var(--accent), 0.12);
  pointer-events: none;
}

.card--success {
  --accent: 52, 211, 166;
  box-shadow: 0 0 18px rgba(52, 211, 166, 0.26);
  animation: successBloom 1.15s ease-out 1;
}

.card__shine {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 42%,
    rgba(255, 255, 255, 0.38) 50%,
    transparent 58%
  );
  transform: translateX(-160%);
  animation: successShine 0.95s ease-out 0.12s 1;
}

.card--error {
  --accent: 244, 110, 122;
  box-shadow: 0 0 18px rgba(244, 110, 122, 0.3);
}

.card--error .card__layers {
  animation:
    errorGlitch 0.5s steps(2, end) 1,
    errorGlitchIdle 4.5s steps(1, end) 1.1s infinite;
}

.card--error .card__title {
  text-shadow:
    1px 0 rgba(244, 110, 122, 0.55),
    -1px 0 rgba(96, 200, 224, 0.45);
}

.card--warning {
  --accent: 240, 190, 96;
  animation: warningBreath 1.9s ease-in-out infinite;
}

.card--warning .card__layers {
  animation: warningShake 0.45s ease-in-out 1;
}

.card--warning .card__icon {
  animation: warningPulse 1.3s ease-in-out infinite;
}

.card--info {
  --accent: 120, 190, 236;
  box-shadow: 0 0 16px rgba(120, 190, 236, 0.26);
}

.card--info .card__icon {
  animation: infoFlip 0.75s ease-out 1;
}

.card--success .card__icon {
  color: rgba(72, 218, 176, 0.96);
}

.card--error .card__icon {
  color: rgba(246, 122, 134, 0.96);
}

.card--warning .card__icon {
  color: rgba(242, 196, 104, 0.98);
}

.card--info .card__icon {
  color: rgba(134, 198, 240, 0.98);
}

.card--typed :deep(.progress__line) {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--accent), 0.85) 18%,
    rgba(var(--accent), 1) 50%,
    rgba(var(--accent), 0.85) 82%,
    transparent 100%
  );
  box-shadow:
    0 0 10px rgba(var(--accent), 0.7),
    0 0 4px rgba(var(--accent), 0.55);
}

@keyframes successBloom {
  0% {
    box-shadow: 0 0 0 rgba(52, 211, 166, 0);
  }
  28% {
    box-shadow: 0 0 36px rgba(52, 211, 166, 0.58);
  }
  100% {
    box-shadow: 0 0 18px rgba(52, 211, 166, 0.26);
  }
}

@keyframes successShine {
  to {
    transform: translateX(160%);
  }
}

@keyframes errorGlitch {
  0% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
  20% {
    transform: translate(-3px, 1px);
    clip-path: inset(18% 0 42% 0);
  }
  40% {
    transform: translate(3px, -1px);
    clip-path: inset(52% 0 8% 0);
  }
  60% {
    transform: translate(-2px, 0);
    clip-path: inset(8% 0 60% 0);
  }
  80% {
    transform: translate(2px, 1px);
    clip-path: inset(40% 0 30% 0);
  }
  100% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
}

@keyframes errorGlitchIdle {
  0%,
  96%,
  100% {
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
  }
  97% {
    transform: translate(-2px, 0);
    clip-path: inset(30% 0 44% 0);
  }
  98.5% {
    transform: translate(2px, 0);
    clip-path: inset(58% 0 12% 0);
  }
}

@keyframes warningBreath {
  0%,
  100% {
    box-shadow: 0 0 12px rgba(240, 190, 96, 0.22);
  }
  50% {
    box-shadow: 0 0 26px rgba(240, 190, 96, 0.5);
  }
}

@keyframes warningShake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-3px);
  }
  40% {
    transform: translateX(3px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
}

@keyframes warningPulse {
  0%,
  100% {
    opacity: 0.78;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.14);
  }
}

@keyframes infoFlip {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
</style>
