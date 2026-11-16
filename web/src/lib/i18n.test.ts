import { describe, expect, it } from 'vitest'
import { applyTranslations, m, tr } from './i18n.svelte'
import { locale } from './locale.svelte'

describe('i18n', () => {
  it('serves the compiled message when the game sent nothing', () => {
    expect(m.notification_queued({ count: 3 })).toBe('3 en attente')
  })

  it('prefers the string the game pushed for the running language', () => {
    applyTranslations(locale.current, { notification_queued: '{count} à venir' })

    expect(m.notification_queued({ count: 2 })).toBe('2 à venir')
  })

  it('reads a message by runtime key', () => {
    expect(tr('notification_queued', { count: 1 })).toBe(m.notification_queued({ count: 1 }))
  })

  it('switches the language along with the strings', () => {
    applyTranslations('en', { notification_queued: '{count} pending' })

    expect(locale.current).toBe('en')
    expect(m.notification_queued({ count: 4 })).toBe('4 pending')
  })
})
