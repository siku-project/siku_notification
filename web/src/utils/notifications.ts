export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type NotificationImageMode = 'side' | 'background'

export type NotificationType = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface NotificationInput {
  type?: NotificationType
  title?: string
  subtitle?: string
  description?: string
  icon?: string
  image?: string
  imageMode?: NotificationImageMode
  position?: NotificationPosition
  duration?: number
  color?: string
  priority?: number
}

export interface NotificationItem {
  id: number
  type: NotificationType
  title?: string
  subtitle?: string
  description?: string
  icon?: string
  image?: string
  imageMode: NotificationImageMode
  position: NotificationPosition
  duration: number
  createdAt: number
  color?: string
  priority?: number
}

export const NOTIFICATION_POSITIONS: NotificationPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

export const NOTIFICATION_TYPES: NotificationType[] = [
  'default',
  'success',
  'warning',
  'error',
  'info',
]

export const NOTIFICATION_DEFAULT_ICONS: Record<NotificationType, string | undefined> = {
  default: undefined,
  success: 'mdi-check-circle-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-close-circle-outline',
  info: 'mdi-information-outline',
}

export const DEFAULT_POSITION: NotificationPosition = 'top-right'
export const DEFAULT_DURATION = 5000
export const MAX_DURATION = 2_147_483_647
export const DEFAULT_IMAGE_MODE: NotificationImageMode = 'side'

export interface NotificationDefaults {
  position: NotificationPosition
  duration: number
}

export const DEFAULT_NOTIFICATION_DEFAULTS: NotificationDefaults = {
  position: DEFAULT_POSITION,
  duration: DEFAULT_DURATION,
}

const isPosition = (value: unknown): value is NotificationPosition =>
  typeof value === 'string' && (NOTIFICATION_POSITIONS as string[]).includes(value)

const isType = (value: unknown): value is NotificationType =>
  typeof value === 'string' && (NOTIFICATION_TYPES as string[]).includes(value)

export const normalizeNotification = (
  input: NotificationInput,
  id: number,
  createdAt: number,
  defaults: NotificationDefaults = DEFAULT_NOTIFICATION_DEFAULTS,
): NotificationItem => {
  const type: NotificationType = isType(input.type) ? input.type : 'default'

  return {
    id,
    createdAt,
    type,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    icon: input.icon ?? NOTIFICATION_DEFAULT_ICONS[type],
    image: input.image,
    imageMode: input.imageMode === 'background' ? 'background' : DEFAULT_IMAGE_MODE,
    position: isPosition(input.position) ? input.position : defaults.position,
    duration:
      typeof input.duration === 'number' && Number.isFinite(input.duration) && input.duration > 0
        ? Math.min(input.duration, MAX_DURATION)
        : defaults.duration,
    color: input.color,
    priority: input.priority,
  }
}
