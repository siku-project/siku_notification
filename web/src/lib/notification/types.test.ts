import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, mergeConfig, normalize, readPosition, signature } from './types'

const at = (input: Parameters<typeof normalize>[0]) => normalize(input, DEFAULT_CONFIG, 'w:1', 1000)

describe('normalize', () => {
  it('refuses a notification with nothing to show', () => {
    expect(at({})).toBeNull()
    expect(at({ title: '   ' })).toBeNull()
    expect(at({ type: 'error', icon: 'alert', duration: 3000 })).toBeNull()
  })

  it('fills the defaults of a bare title', () => {
    const item = at({ title: 'Enregistré.' })

    expect(item).toMatchObject({
      id: 'w:1',
      type: 'default',
      title: 'Enregistré.',
      icon: 'bell',
      imageMode: 'side',
      position: 'top-right',
      duration: 5000,
      count: 1,
      createdAt: 1000,
    })
    expect(item?.description).toBeUndefined()
  })

  it('promotes a lone description to the title', () => {
    const item = at({ type: 'info', description: 'Noah Bennett a rejoint la ville.' })

    expect(item?.title).toBe('Noah Bennett a rejoint la ville.')
    expect(item?.description).toBeUndefined()
    expect(item?.icon).toBe('info')
  })

  it('keeps the id the game chose and trims every text', () => {
    const item = at({ id: 's:12', title: '  Objet reçu ', description: ' Trousse ', value: ' ×1 ' })

    expect(item).toMatchObject({
      id: 's:12',
      title: 'Objet reçu',
      description: 'Trousse',
      value: '×1',
    })
  })

  it('reads subtitle as the old name of value', () => {
    expect(at({ title: 'Objet reçu', subtitle: 'x1 Trousse' })?.value).toBe('x1 Trousse')
    expect(at({ title: 'Objet reçu', subtitle: 'ignored', value: '×1' })?.value).toBe('×1')
  })

  it('falls back to the icon of the type for an unknown icon', () => {
    expect(at({ type: 'success', title: 'Ok', icon: 'mdi-hamburger' })?.icon).toBe('check')
    expect(at({ type: 'warning', title: 'Ok', icon: 'fuel' })?.icon).toBe('fuel')
    expect(at({ type: 'error', title: 'Ok' })?.icon).toBe('close')
  })

  it('accepts only web images and drops the mode without one', () => {
    expect(
      at({ title: 'Ok', image: 'https://cdn/photo.webp', imageMode: 'background' }),
    ).toMatchObject({ image: 'https://cdn/photo.webp', imageMode: 'background' })
    expect(at({ title: 'Ok', image: 'nui://siku_studio/html/a.webp' })?.image).toBe(
      'nui://siku_studio/html/a.webp',
    )
    expect(at({ title: 'Ok', image: 'javascript:alert(1)' })?.image).toBeUndefined()
    expect(at({ title: 'Ok', imageMode: 'background' })?.imageMode).toBe('side')
  })

  it('understands the old names of the middle row', () => {
    expect(readPosition('center-left')).toBe('left')
    expect(readPosition('center-right')).toBe('right')
    expect(readPosition('center')).toBe('center')
    expect(readPosition('nowhere')).toBeUndefined()
    expect(at({ title: 'Ok', position: 'center-right' })?.position).toBe('right')
  })

  it('clamps the duration and ignores an invalid one', () => {
    expect(at({ title: 'Ok', duration: 90_000 })?.duration).toBe(30_000)
    expect(at({ title: 'Ok', duration: -5 })?.duration).toBe(5000)
    expect(at({ title: 'Ok', duration: 'long' })?.duration).toBe(5000)
  })

  it('caps the length of each text', () => {
    const item = at({ title: 'a'.repeat(100), description: 'b'.repeat(300), value: 'c'.repeat(40) })

    expect(item?.title).toHaveLength(64)
    expect(item?.description).toHaveLength(256)
    expect(item?.value).toHaveLength(32)
  })
})

describe('signature', () => {
  it('matches notifications that say the same thing at the same place', () => {
    const one = at({ type: 'error', title: 'Refusé', description: 'Pas la permission.' })
    const two = normalize(
      { type: 'error', title: 'Refusé', description: 'Pas la permission.', duration: 1 },
      DEFAULT_CONFIG,
      'w:2',
      2000,
    )
    const other = at({ type: 'error', title: 'Refusé', description: 'Autre raison.' })

    expect(signature(one!)).toBe(signature(two!))
    expect(signature(one!)).not.toBe(signature(other!))
  })
})

describe('mergeConfig', () => {
  it('keeps what is set when the change is invalid', () => {
    expect(
      mergeConfig(DEFAULT_CONFIG, {
        maxVisiblePerPosition: 2.5,
        defaultPosition: 'nowhere',
        defaultDuration: 0,
        maxDuration: 'x',
        coalesce: 'yes',
      }),
    ).toEqual(DEFAULT_CONFIG)
  })

  it('applies a valid change, old position names included', () => {
    expect(
      mergeConfig(DEFAULT_CONFIG, {
        maxVisiblePerPosition: 3,
        defaultPosition: 'center-left',
        defaultDuration: 8000,
        maxDuration: 60_000,
        coalesce: false,
      }),
    ).toEqual({
      maxVisiblePerPosition: 3,
      defaultPosition: 'left',
      defaultDuration: 8000,
      maxDuration: 60_000,
      coalesce: false,
    })
  })
})
