import {
  mdiAlertOutline,
  mdiBellOutline,
  mdiCheck,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCodeTags,
  mdiInformationOutline,
  mdiMedicalBag,
  mdiMessageOffOutline,
  mdiMessageOutline,
  mdiMonitorOff,
  mdiViewDashboardOutline,
} from '@mdi/js'

export const DEFAULT_ICON_PATH = mdiBellOutline

const ICON_PATHS: Record<string, string> = {
  'mdi-alert-outline': mdiAlertOutline,
  'mdi-bell-outline': mdiBellOutline,
  'mdi-check': mdiCheck,
  'mdi-check-circle-outline': mdiCheckCircleOutline,
  'mdi-close-circle-outline': mdiCloseCircleOutline,
  'mdi-code-tags': mdiCodeTags,
  'mdi-information-outline': mdiInformationOutline,
  'mdi-medical-bag': mdiMedicalBag,
  'mdi-message-off-outline': mdiMessageOffOutline,
  'mdi-message-outline': mdiMessageOutline,
  'mdi-monitor-off': mdiMonitorOff,
  'mdi-view-dashboard-outline': mdiViewDashboardOutline,
}

export const resolveIcon = (name: string | undefined): string | undefined => {
  if (!name) {
    return undefined
  }
  return ICON_PATHS[name] ?? DEFAULT_ICON_PATH
}
