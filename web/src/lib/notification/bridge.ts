import { sendNuiCallback } from '@/lib/nui'

/** Every call the interface makes to the game, by name. The browser playground swaps them for local echoes. */
export const game = {
  ready: () => sendNuiCallback('ready'),
}
