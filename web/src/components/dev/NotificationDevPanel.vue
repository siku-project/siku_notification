<script setup lang="ts">
import { ref } from 'vue'
import IcePanel from '@/components/ui/IcePanel.vue'
import NotificationCenter from '@/components/notification/NotificationCenter.vue'
import { useNotificationStore } from '@/stores/notifications'
import { NOTIFICATION_POSITIONS, NOTIFICATION_TYPES } from '@/utils/notifications'
import type {
  NotificationImageMode,
  NotificationPosition,
  NotificationType,
} from '@/utils/notifications'
import SAMPLE_IMAGE from '@/assets/boilerplate-background.jpg'

const store = useNotificationStore()

const title = ref('Notification')
const subtitle = ref('')
const description = ref('')
const icon = ref('')
const image = ref('')
const imageMode = ref<NotificationImageMode>('side')
const position = ref<NotificationPosition>('top-right')
const duration = ref(5000)
const spamCount = ref(0)
const type = ref<NotificationType>('default')

const send = (): void => {
  store.show({
    type: type.value,
    title: title.value || undefined,
    subtitle: subtitle.value || undefined,
    description: description.value || undefined,
    icon: icon.value || undefined,
    image: image.value || undefined,
    imageMode: imageMode.value,
    position: position.value,
    duration: duration.value,
  })
}

const spam = (): void => {
  for (let index = 0; index < 8; index += 1) {
    spamCount.value += 1
    store.show({
      title: `Notification ${spamCount.value}`,
      description: 'Test de file d’attente et d’empilement.',
      position: position.value,
      duration: 5000,
    })
  }
}

const clearAll = (): void => {
  store.clear()
}

const presetSaved = (): void => {
  store.show({ title: 'Enregistré.', duration: 2500, position: position.value })
}

const presetItem = (): void => {
  store.show({
    title: 'Objet reçu',
    subtitle: 'x1 Trousse de soin',
    icon: 'mdi-medical-bag',
    image: SAMPLE_IMAGE,
    imageMode: 'side',
    duration: 5000,
    position: position.value,
  })
}

const presetAchievement = (): void => {
  store.show({
    title: 'Succès débloqué',
    description: 'Vous avez terminé votre première mission avec brio.',
    image: SAMPLE_IMAGE,
    imageMode: 'background',
    duration: 8000,
    position: position.value,
  })
}

const presetLong = (): void => {
  store.show({
    title: 'Rapport de mission',
    subtitle: 'Braquage de la banque centrale',
    description:
      'Longue description qui doit passer à la ligne naturellement sans jamais paraître à l’étroit, tout en restant parfaitement lisible sur plusieurs lignes.',
    duration: 8000,
    position: position.value,
  })
}

const STATUS_PRESETS: Record<
  Exclude<NotificationType, 'default'>,
  { title: string; description: string }
> = {
  success: { title: 'Succès', description: 'Opération réussie avec brio.' },
  error: { title: 'Erreur', description: 'Une erreur est survenue.' },
  warning: { title: 'Attention', description: 'Vérifie avant de continuer.' },
  info: { title: 'Information', description: 'Nouvelle information disponible.' },
}

const presetStatus = (value: Exclude<NotificationType, 'default'>): void => {
  const preset = STATUS_PRESETS[value]
  store.show({
    type: value,
    title: preset.title,
    description: preset.description,
    duration: 6000,
    position: position.value,
  })
}
</script>

<template>
  <NotificationCenter />

  <div class="panel">
    <IcePanel variant="primary" class="panel__box">
      <div class="panel__body">
        <p class="ice-title panel__title text-[10px]">Notifications — Dev</p>

        <div class="field">
          <span class="field__label">Type</span>
          <div class="types">
            <button
              v-for="value in NOTIFICATION_TYPES"
              :key="value"
              type="button"
              class="type-btn"
              :class="[`type-btn--${value}`, { 'type-btn--on': type === value }]"
              @click="type = value"
            >
              {{ value }}
            </button>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Titre</span>
          <input v-model="title" class="field__input" type="text" />
        </label>

        <label class="field">
          <span class="field__label">Sous-titre</span>
          <input v-model="subtitle" class="field__input" type="text" />
        </label>

        <label class="field">
          <span class="field__label">Description</span>
          <textarea
            v-model="description"
            class="field__input field__input--area"
            rows="2"
          ></textarea>
        </label>

        <label class="field">
          <span class="field__label">Icône (mdi)</span>
          <input v-model="icon" class="field__input" type="text" placeholder="mdi-bell-outline" />
        </label>

        <div class="row">
          <label class="field field--grow">
            <span class="field__label">Image</span>
            <select v-model="image" class="field__input">
              <option value="">Aucune</option>
              <option :value="SAMPLE_IMAGE">Exemple</option>
            </select>
          </label>

          <div class="field field--grow">
            <span class="field__label">Mode image</span>
            <div class="toggle">
              <button
                type="button"
                class="toggle__btn"
                :class="{ 'toggle__btn--on': imageMode === 'side' }"
                @click="imageMode = 'side'"
              >
                Côté
              </button>
              <button
                type="button"
                class="toggle__btn"
                :class="{ 'toggle__btn--on': imageMode === 'background' }"
                @click="imageMode = 'background'"
              >
                Fond
              </button>
            </div>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Position</span>
          <select v-model="position" class="field__input">
            <option v-for="value in NOTIFICATION_POSITIONS" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </label>

        <div class="row row--end">
          <label class="field field--grow">
            <span class="field__label">Durée (ms)</span>
            <input v-model.number="duration" class="field__input" type="number" min="500" step="500" />
          </label>
        </div>

        <div class="actions">
          <button type="button" class="btn btn--primary" @click="send">Envoyer</button>
          <button type="button" class="btn" @click="spam">Spam ×8</button>
          <button type="button" class="btn" @click="clearAll">Tout effacer</button>
        </div>

        <div class="ice-divider panel__divider"></div>

        <div class="presets">
          <button type="button" class="btn btn--ghost" @click="presetSaved">Enregistré.</button>
          <button type="button" class="btn btn--ghost" @click="presetItem">Objet</button>
          <button type="button" class="btn btn--ghost" @click="presetAchievement">
            Succès img
          </button>
          <button type="button" class="btn btn--ghost" @click="presetLong">Texte long</button>
        </div>

        <div class="presets">
          <button type="button" class="btn btn--ghost" @click="presetStatus('success')">
            Success
          </button>
          <button type="button" class="btn btn--ghost" @click="presetStatus('error')">Error</button>
          <button type="button" class="btn btn--ghost" @click="presetStatus('warning')">
            Warning
          </button>
          <button type="button" class="btn btn--ghost" @click="presetStatus('info')">Info</button>
        </div>
      </div>
    </IcePanel>
  </div>
</template>

<style scoped>
.panel {
  position: fixed;
  top: 50%;
  left: 2.5rem;
  z-index: 60;
  width: 320px;
  max-width: 90vw;
  transform: translateY(-50%);
}

.panel__box {
  max-height: 88vh;
  overflow-y: auto;
}

.panel__body {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 22px;
}

.panel__title {
  text-align: center;
  margin-bottom: 2px;
}

.panel__divider {
  height: 1px;
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field--grow {
  flex: 1 1 0;
  min-width: 0;
}

.field__label {
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(198, 224, 243, 0.5);
}

.field__input {
  width: 100%;
  padding: 8px 11px;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.16);
  background: rgba(11, 25, 44, 0.66);
  color: rgba(242, 248, 253, 0.92);
  font-size: 12.5px;
  font-weight: 300;
  outline: none;
  transition: border-color 0.25s ease;
}

.field__input:focus {
  border-color: rgba(216, 234, 250, 0.4);
}

.field__input--area {
  resize: none;
  line-height: 1.45;
}

.row {
  display: flex;
  gap: 12px;
}

.row--end {
  align-items: flex-end;
}

.toggle {
  display: flex;
  gap: 6px;
}

.toggle__btn {
  flex: 1 1 0;
  padding: 8px 0;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.14);
  background: rgba(11, 25, 44, 0.5);
  color: rgba(198, 224, 243, 0.55);
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.toggle__btn--on {
  border-color: rgba(150, 212, 246, 0.42);
  background: rgba(71, 133, 189, 0.22);
  color: rgba(242, 248, 253, 0.95);
}

.check {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 9px;
  font-size: 11.5px;
  color: rgba(198, 224, 243, 0.6);
  cursor: pointer;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 8px;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  flex: 1 1 auto;
  padding: 9px 12px;
  border-radius: 0.6rem;
  border: 1px solid rgba(216, 234, 250, 0.16);
  background: rgba(11, 25, 44, 0.55);
  color: rgba(226, 240, 250, 0.82);
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn:hover {
  border-color: rgba(216, 234, 250, 0.32);
  color: rgba(244, 250, 255, 0.95);
}

.btn--primary {
  border-color: rgba(150, 212, 246, 0.42);
  background: rgba(71, 133, 189, 0.28);
  color: rgba(244, 250, 255, 0.96);
}

.btn--ghost {
  flex: 1 1 40%;
  background: rgba(11, 25, 44, 0.4);
  font-size: 11px;
}

.types {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.type-btn {
  flex: 1 1 30%;
  padding: 7px 0;
  border-radius: 0.55rem;
  border: 1px solid rgba(216, 234, 250, 0.14);
  background: rgba(11, 25, 44, 0.5);
  color: rgba(198, 224, 243, 0.58);
  font-size: 10.5px;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn--on {
  border-color: rgba(150, 212, 246, 0.42);
  background: rgba(71, 133, 189, 0.22);
  color: rgba(242, 248, 253, 0.95);
}

.type-btn--success.type-btn--on {
  border-color: rgba(52, 211, 166, 0.5);
  background: rgba(52, 211, 166, 0.16);
  color: rgba(184, 240, 224, 0.96);
}

.type-btn--error.type-btn--on {
  border-color: rgba(244, 110, 122, 0.5);
  background: rgba(244, 110, 122, 0.16);
  color: rgba(250, 192, 198, 0.96);
}

.type-btn--warning.type-btn--on {
  border-color: rgba(240, 190, 96, 0.5);
  background: rgba(240, 190, 96, 0.16);
  color: rgba(248, 226, 170, 0.96);
}

.type-btn--info.type-btn--on {
  border-color: rgba(120, 190, 236, 0.5);
  background: rgba(120, 190, 236, 0.16);
  color: rgba(198, 228, 248, 0.96);
}
</style>
