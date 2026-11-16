import { iconNames, type IconName } from '@siku/ui'
import type { ToastTone } from '@siku/ui'

export const TYPES = ['default', 'success', 'warning', 'error', 'info'] as const
export const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const
export const IMAGE_MODES = ['side', 'background'] as const

export type NotificationType = (typeof TYPES)[number]
export type NotificationPosition = (typeof POSITIONS)[number]
export type NotificationImageMode = (typeof IMAGE_MODES)[number]

/** The old names of the middle row, still accepted from callers. */
const POSITION_ALIASES: Record<string, NotificationPosition> = {
  'center-left': 'left',
  'center-right': 'right',
}

export const TONES: Record<NotificationType, ToastTone> = {
  default: 'neutral',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'neutral',
}

export const ICONS: Record<NotificationType, IconName> = {
  default: 'bell',
  success: 'check',
  warning: 'alert',
  error: 'close',
  info: 'info',
}

export const MAX_TITLE_LENGTH = 64
export const MAX_DESCRIPTION_LENGTH = 256
export const MAX_VALUE_LENGTH = 32

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  value?: string
  icon: IconName
  image?: string
  imageMode: NotificationImageMode
  position: NotificationPosition
  duration: number
  count: number
  createdAt: number
}

/** A notification as the game sends it: nothing is trusted, a title or a description is required. */
export interface NotificationInput {
  id?: unknown
  type?: unknown
  title?: unknown
  description?: unknown
  value?: unknown
  subtitle?: unknown
  icon?: unknown
  image?: unknown
  imageMode?: unknown
  position?: unknown
  duration?: unknown
}

export interface NotificationConfig {
  maxVisiblePerPosition: number
  defaultPosition: NotificationPosition
  defaultDuration: number
  maxDuration: number
  coalesce: boolean
}

export const DEFAULT_CONFIG: NotificationConfig = {
  maxVisiblePerPosition: 5,
  defaultPosition: 'top-right',
  defaultDuration: 5000,
  maxDuration: 30_000,
  coalesce: true,
}

export const isType = (value: unknown): value is NotificationType =>
  typeof value === 'string' && (TYPES as readonly string[]).includes(value)

export const isPosition = (value: unknown): value is NotificationPosition =>
  typeof value === 'string' && (POSITIONS as readonly string[]).includes(value)

export const isImageMode = (value: unknown): value is NotificationImageMode =>
  typeof value === 'string' && (IMAGE_MODES as readonly string[]).includes(value)

export const isIconName = (value: unknown): value is IconName =>
  typeof value === 'string' && (iconNames as readonly string[]).includes(value)

/** The position a caller asked for, old names included, or none. */
export const readPosition = (value: unknown): NotificationPosition | undefined => {
  if (isPosition(value)) {
    return value
  }

  return typeof value === 'string' ? POSITION_ALIASES[value] : undefined
}

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const text = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return undefined
  }

  return [...trimmed].slice(0, max).join('')
}

const IMAGE_PATTERN = /^(https?:\/\/|nui:\/\/|data:image\/)/i

const image = (value: unknown): string | undefined =>
  typeof value === 'string' && IMAGE_PATTERN.test(value.trim()) ? value.trim() : undefined

/** Fills the gaps of a config change with what is already set, ignoring anything invalid. */
export const mergeConfig = (
  current: NotificationConfig,
  input: Partial<Record<keyof NotificationConfig, unknown>>,
): NotificationConfig => ({
  maxVisiblePerPosition:
    isPositiveNumber(input.maxVisiblePerPosition) && Number.isInteger(input.maxVisiblePerPosition)
      ? input.maxVisiblePerPosition
      : current.maxVisiblePerPosition,
  defaultPosition: readPosition(input.defaultPosition) ?? current.defaultPosition,
  defaultDuration: isPositiveNumber(input.defaultDuration)
    ? input.defaultDuration
    : current.defaultDuration,
  maxDuration: isPositiveNumber(input.maxDuration) ? input.maxDuration : current.maxDuration,
  coalesce: typeof input.coalesce === 'boolean' ? input.coalesce : current.coalesce,
})

/**
 * Turns what the game sent into a notification the interface can show, or
 * nothing when there is no text to show. A lone description becomes the
 * title, `subtitle` is the old name of `value`, an unknown icon falls back
 * to the icon of the type, and the duration is clamped to the config.
 */
export const normalize = (
  input: NotificationInput,
  config: NotificationConfig,
  fallbackId: string,
  now: number,
): Notification | null => {
  const title = text(input.title, MAX_TITLE_LENGTH)
  const description = text(input.description, MAX_DESCRIPTION_LENGTH)

  if (!title && !description) {
    return null
  }

  const type = isType(input.type) ? input.type : 'default'
  const mode = isImageMode(input.imageMode) ? input.imageMode : 'side'
  const picture = image(input.image)
  const duration = isPositiveNumber(input.duration) ? input.duration : config.defaultDuration

  return {
    id: typeof input.id === 'string' && input.id.length > 0 ? input.id : fallbackId,
    type,
    title: title ?? [...(description as string)].slice(0, MAX_TITLE_LENGTH).join(''),
    description: title ? description : undefined,
    value: text(input.value ?? input.subtitle, MAX_VALUE_LENGTH),
    icon: isIconName(input.icon) ? input.icon : ICONS[type],
    image: picture,
    imageMode: picture ? mode : 'side',
    position: readPosition(input.position) ?? config.defaultPosition,
    duration: Math.min(duration, config.maxDuration),
    count: 1,
    createdAt: now,
  }
}

/** Two notifications that say the same thing at the same place merge into one. */
export const signature = (notification: Notification): string =>
  [
    notification.position,
    notification.type,
    notification.title,
    notification.description ?? '',
    notification.value ?? '',
    notification.image ?? '',
  ].join('\u0000')
