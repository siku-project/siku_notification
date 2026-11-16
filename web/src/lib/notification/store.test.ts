import { beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from './store.svelte'

const action = (name: string) => `siku_notification:nui:${name}`

describe('store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    store.clear()
    store.setConfig({
      maxVisiblePerPosition: 2,
      defaultPosition: 'top-right',
      defaultDuration: 1000,
      maxDuration: 30_000,
      coalesce: true,
    })
  })

  it('ignores messages that are not ours', () => {
    expect(store.applyMessage({ action: 'other:thing' })).toBe(false)
    expect(store.applyMessage(null)).toBe(false)
    expect(store.applyMessage({ action: action('unknown') })).toBe(false)
    expect(store.applyMessage({ action: action('show') })).toBe(false)
    expect(store.applyMessage({ action: action('show'), notification: { icon: 'bell' } })).toBe(
      true,
    )
    expect(store.active).toEqual([])
  })

  it('shows what the game sends and lets it expire', () => {
    store.applyMessage({
      action: action('show'),
      notification: { id: 's:1', type: 'success', title: 'Objet reçu', duration: 500 },
    })

    expect(store.active.map((item) => item.id)).toEqual(['s:1'])
    expect(store.positions).toEqual(['top-right'])

    vi.advanceTimersByTime(499)
    expect(store.active).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.active).toEqual([])
    expect(store.positions).toEqual([])
  })

  it('keeps the overflow waiting and promotes it in order of arrival', () => {
    store.show({ title: 'one', duration: 1000 })
    store.show({ title: 'two', duration: 1000 })
    store.show({ title: 'three', duration: 1000 })
    store.show({ title: 'four', duration: 1000 })
    store.show({ title: 'elsewhere', position: 'bottom-left' })

    expect(store.active.map((item) => item.title)).toEqual(['one', 'two', 'elsewhere'])
    expect(store.queue.map((item) => item.title)).toEqual(['three', 'four'])
    expect(store.queuedFor('top-right')).toBe(2)
    expect(store.queuedFor('bottom-left')).toBe(0)

    vi.advanceTimersByTime(1000)

    expect(store.active.map((item) => item.title)).toEqual(['three', 'four'])
    expect(store.queue).toEqual([])

    vi.advanceTimersByTime(1000)

    expect(store.active).toEqual([])
  })

  it('starts the timer of a waiting notification only once it shows', () => {
    store.show({ title: 'one', duration: 1000 })
    store.show({ title: 'two', duration: 1000 })
    store.show({ title: 'three', duration: 300 })

    vi.advanceTimersByTime(900)
    expect(store.queue.map((item) => item.title)).toEqual(['three'])

    vi.advanceTimersByTime(100)
    expect(store.active.map((item) => item.title)).toEqual(['three'])

    vi.advanceTimersByTime(299)
    expect(store.active).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.active).toEqual([])
  })

  it('puts the newest nearest the screen edge', () => {
    store.show({ title: 'old', position: 'top-left' })
    store.show({ title: 'new', position: 'top-left' })
    store.show({ title: 'old', position: 'bottom-right' })
    store.show({ title: 'new', position: 'bottom-right' })
    store.show({ title: 'old', position: 'right' })
    store.show({ title: 'new', position: 'right' })

    expect(store.stackFor('top-left').map((item) => item.title)).toEqual(['new', 'old'])
    expect(store.stackFor('bottom-right').map((item) => item.title)).toEqual(['old', 'new'])
    expect(store.stackFor('right').map((item) => item.title)).toEqual(['new', 'old'])
  })

  it('merges an identical notification and gives it a fresh timer', () => {
    const first = store.show({ type: 'error', title: 'Refusé', duration: 1000 })

    vi.advanceTimersByTime(800)

    const again = store.show({ type: 'error', title: 'Refusé', duration: 1000 })

    expect(again?.id).toBe(first?.id)
    expect(store.active).toHaveLength(1)
    expect(store.active[0]?.count).toBe(2)

    vi.advanceTimersByTime(800)
    expect(store.active).toHaveLength(1)

    vi.advanceTimersByTime(200)
    expect(store.active).toEqual([])
  })

  it('stacks identical notifications when merging is off', () => {
    store.setConfig({ coalesce: false })
    store.show({ title: 'Refusé' })
    store.show({ title: 'Refusé' })

    expect(store.active).toHaveLength(2)
    expect(store.active.every((item) => item.count === 1)).toBe(true)
  })

  it('dismisses by id, on screen or waiting', () => {
    store.show({ id: 's:1', title: 'one' })
    store.show({ id: 's:2', title: 'two' })
    store.show({ id: 's:3', title: 'three' })

    expect(store.applyMessage({ action: action('dismiss'), id: 's:3' })).toBe(true)
    expect(store.queue).toEqual([])

    expect(store.applyMessage({ action: action('dismiss'), id: 's:1' })).toBe(true)
    expect(store.active.map((item) => item.id)).toEqual(['s:2'])

    expect(store.applyMessage({ action: action('dismiss'), id: 7 })).toBe(false)
  })

  it('clears one position or everything, queue included', () => {
    store.show({ title: 'a', position: 'top-left' })
    store.show({ title: 'b', position: 'top-left' })
    store.show({ title: 'c', position: 'top-left' })
    store.show({ title: 'd', position: 'center-right' })

    expect(store.applyMessage({ action: action('clear'), position: 'top-left' })).toBe(true)
    expect(store.active.map((item) => item.title)).toEqual(['d'])
    expect(store.queue).toEqual([])
    expect(store.active[0]?.position).toBe('right')

    expect(store.applyMessage({ action: action('clear') })).toBe(true)
    expect(store.active).toEqual([])
  })

  it('applies a config change and frees the queue when the cap grows', () => {
    store.show({ title: 'one' })
    store.show({ title: 'two' })
    store.show({ title: 'three' })

    expect(
      store.applyMessage({
        action: action('setConfig'),
        config: { maxVisiblePerPosition: 3, defaultPosition: 'bottom-center' },
      }),
    ).toBe(true)

    expect(store.config.maxVisiblePerPosition).toBe(3)
    expect(store.config.defaultPosition).toBe('bottom-center')
    expect(store.active.map((item) => item.title)).toEqual(['one', 'two', 'three'])
    expect(store.show({ title: 'four' })?.position).toBe('bottom-center')
  })
})
