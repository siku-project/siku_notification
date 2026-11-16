import sampleImage from '@/assets/boilerplate-background.jpg'
import { store } from '../store.svelte'
import type { NotificationInput, NotificationPosition } from '../types'

export interface Preset {
  name: string
  input: NotificationInput
}

/** What the server would send, one example per shape the card can take. */
export const PRESETS: Preset[] = [
  { name: 'Saved', input: { title: 'Enregistré.', duration: 2500 } },
  {
    name: 'Item received',
    input: {
      type: 'success',
      title: 'Objet reçu',
      description: 'Trousse de soin ajoutée à ton inventaire.',
      value: '×1',
      icon: 'medkit',
    },
  },
  {
    name: 'Transfer',
    input: {
      type: 'success',
      title: 'Maze Bank',
      description: 'Virement reçu de Lina Moreau',
      value: '+1 250 $',
      icon: 'bank',
    },
  },
  {
    name: 'Low fuel',
    input: {
      type: 'warning',
      title: 'Réserve d’essence',
      description: 'Station la plus proche : 600 m.',
      icon: 'fuel',
    },
  },
  {
    name: 'Denied',
    input: {
      type: 'error',
      title: 'Action refusée',
      description: 'Tu n’as pas la permission d’utiliser cette commande.',
    },
  },
  {
    name: 'Message',
    input: {
      type: 'info',
      title: 'Ray Kowalski',
      description: 'Je suis devant le Bean Machine.',
      icon: 'msg',
    },
  },
  {
    name: 'Photo',
    input: {
      type: 'success',
      title: 'Sultan RS',
      description: 'Véhicule sorti du garage.',
      icon: 'car',
      image: sampleImage,
      imageMode: 'side',
    },
  },
  {
    name: 'Achievement',
    input: {
      title: 'Succès débloqué',
      description: 'Première mission terminée.',
      image: sampleImage,
      imageMode: 'background',
      duration: 8000,
    },
  },
]

/** Fires a preset where the simulation panel points. */
export const simulatePreset = (preset: Preset, position?: NotificationPosition): void => {
  store.show({ ...preset.input, position })
}

/** Eight notifications at once, to watch the cap and the queue. */
export const simulateBurst = (position?: NotificationPosition): void => {
  for (let index = 1; index <= 8; index += 1) {
    store.show({
      title: `Notification ${index}`,
      description: 'Test de file d’attente et d’empilement.',
      position,
      duration: 4000 + index * 500,
    })
  }
}

/** What the game would have shown before the page opened, for the browser playground. */
export const loadMocks = (): void => {
  if (store.active.length > 0) {
    return
  }

  simulatePreset(PRESETS[2] as Preset)
  simulatePreset(PRESETS[3] as Preset)
}
