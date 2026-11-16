import { RESOURCE } from '@/lib/nui'
import {
  DEFAULT_CONFIG,
  mergeConfig,
  normalize,
  readPosition,
  signature,
  type Notification,
  type NotificationConfig,
  type NotificationInput,
  type NotificationPosition,
} from './types'

interface NuiMessage {
  action?: unknown
  notification?: unknown
  id?: unknown
  position?: unknown
  config?: unknown
}

const PREFIX = `${RESOURCE}:nui:`

let active = $state<Notification[]>([])
let queue = $state<Notification[]>([])
let config = $state<NotificationConfig>({ ...DEFAULT_CONFIG })
const timers: Record<string, number> = {}
let nextId = 1

const countActive = (position: NotificationPosition): number =>
  active.reduce((total, item) => (item.position === position ? total + 1 : total), 0)

const stopTimer = (id: string): void => {
  const handle = timers[id]

  if (handle !== undefined) {
    window.clearTimeout(handle)
    delete timers[id]
  }
}

const startTimer = (item: Notification): void => {
  stopTimer(item.id)
  timers[item.id] = window.setTimeout(() => dismiss(item.id), item.duration)
}

const mount = (item: Notification): void => {
  active = [...active, item]
  startTimer(item)
}

/** Gives the next waiting notification of a position the slot that just freed. */
const promote = (position: NotificationPosition): void => {
  if (countActive(position) >= config.maxVisiblePerPosition) {
    return
  }

  const index = queue.findIndex((item) => item.position === position)

  if (index === -1) {
    return
  }

  const item = queue[index] as Notification

  queue = queue.filter((_, candidate) => candidate !== index)
  mount(item)
}

const dismiss = (id: string): void => {
  stopTimer(id)

  const item = active.find((entry) => entry.id === id)

  if (item) {
    active = active.filter((entry) => entry.id !== id)
    promote(item.position)
    return
  }

  queue = queue.filter((entry) => entry.id !== id)
}

/** Everything the game tells the notifications, and what the player sees of it. */
export const store = {
  get active(): Notification[] {
    return active
  },
  get queue(): Notification[] {
    return queue
  },
  get config(): NotificationConfig {
    return config
  },

  /** The positions that have something to show, in screen order. */
  get positions(): NotificationPosition[] {
    return active
      .map((item) => item.position)
      .filter((position, index, all) => all.indexOf(position) === index)
  },

  /** The visible notifications of a position, the newest nearest the screen edge. */
  stackFor(position: NotificationPosition): Notification[] {
    const items = active.filter((item) => item.position === position)

    return position.startsWith('bottom') ? items : items.reverse()
  },

  queuedFor(position: NotificationPosition): number {
    return queue.reduce((total, item) => (item.position === position ? total + 1 : total), 0)
  },

  /**
   * Shows a notification, or merges it into the identical one already on
   * screen. Full positions keep it waiting, in order of arrival.
   */
  show(input: NotificationInput): Notification | null {
    const item = normalize(input, config, `w:${nextId++}`, Date.now())

    if (!item) {
      return null
    }

    if (config.coalesce) {
      const key = signature(item)
      const twin = active.find((entry) => signature(entry) === key)

      if (twin) {
        const merged = { ...twin, count: twin.count + 1, duration: item.duration }

        active = active.map((entry) => (entry === twin ? merged : entry))
        startTimer(merged)

        return merged
      }
    }

    if (countActive(item.position) < config.maxVisiblePerPosition) {
      mount(item)
    } else {
      queue = [...queue, item]
    }

    return item
  },

  dismiss,

  /** Clears one position, or everything, waiting notifications included. */
  clear(position?: NotificationPosition): void {
    const gone = position ? active.filter((item) => item.position === position) : active

    for (const item of gone) {
      stopTimer(item.id)
    }

    if (position) {
      active = active.filter((item) => item.position !== position)
      queue = queue.filter((item) => item.position !== position)
    } else {
      active = []
      queue = []
    }
  },

  setConfig(input: Partial<Record<keyof NotificationConfig, unknown>>): void {
    config = mergeConfig(config, input)

    for (const position of store.positions) {
      promote(position)
    }
  },

  /** Applies a message the game posted; false when it is not one of ours. */
  applyMessage(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    const message = data as NuiMessage

    if (typeof message.action !== 'string' || !message.action.startsWith(PREFIX)) {
      return false
    }

    switch (message.action.slice(PREFIX.length)) {
      case 'show':
        if (message.notification && typeof message.notification === 'object') {
          store.show(message.notification as NotificationInput)
          return true
        }
        return false
      case 'dismiss':
        if (typeof message.id === 'string') {
          dismiss(message.id)
          return true
        }
        return false
      case 'clear':
        store.clear(readPosition(message.position))
        return true
      case 'setConfig':
        if (message.config && typeof message.config === 'object') {
          store.setConfig(message.config as Partial<Record<keyof NotificationConfig, unknown>>)
          return true
        }
        return false
      default:
        return false
    }
  },
}
