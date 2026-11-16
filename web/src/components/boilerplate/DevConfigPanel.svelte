<script lang="ts">
  import { Button, Modal, Segmented, Select, Stepper, TextField, Tooltip } from '@siku/ui'
  import { locale } from '@/lib/locale.svelte'
  import { PRESETS, simulateBurst, simulatePreset } from '@/lib/notification/mock'
  import { store } from '@/lib/notification/store.svelte'
  import {
    IMAGE_MODES,
    isImageMode,
    isPosition,
    isType,
    POSITIONS,
    TYPES,
    type NotificationImageMode,
    type NotificationPosition,
    type NotificationType,
  } from '@/lib/notification/types'

  let open = $state(false)

  let type = $state<NotificationType>('default')
  let title = $state('Notification')
  let description = $state('')
  let value = $state('')
  let icon = $state('')
  let image = $state('')
  let imageMode = $state<NotificationImageMode>('side')
  let position = $state<NotificationPosition | ''>('')
  let duration = $state(5)

  const languages = $derived(
    locale.all.map((language) => ({ value: language, label: language.toUpperCase() })),
  )

  const label = (name: string): string =>
    name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

  const positions = POSITIONS.map((entry) => ({ value: entry, label: label(entry) }))
  const types = TYPES.map((entry) => ({ value: entry, label: label(entry) }))
  const imageModes = IMAGE_MODES.map((entry) => ({ value: entry, label: label(entry) }))

  const target = $derived(position === '' ? undefined : position)

  const send = (): void => {
    store.show({
      type,
      title: title || undefined,
      description: description || undefined,
      value: value || undefined,
      icon: icon || undefined,
      image: image || undefined,
      imageMode,
      position: target,
      duration: duration * 1000,
    })
  }
</script>

<Tooltip text="Simulation">
  <Button
    variant="secondary"
    iconOnly
    icon="settings"
    label="Simulation"
    class="rounded-full"
    onclick={() => (open = true)}
  />
</Tooltip>

<Modal bind:open title="Simulation">
  <div class="flex flex-col gap-5">
    <p class="t-body-sm text-fg-tertiary">
      What the server would send. Nothing here reaches the game.
    </p>

    <div class="flex flex-wrap gap-2">
      {#each PRESETS as preset (preset.name)}
        <Button size="sm" onclick={() => simulatePreset(preset, target)}>{preset.name}</Button>
      {/each}
      <Button size="sm" variant="ghost" icon="layers" onclick={() => simulateBurst(target)}>
        Burst ×8
      </Button>
      <Button size="sm" variant="ghost" icon="trash" onclick={() => store.clear()}>Clear</Button>
    </div>

    <Select
      label="Type"
      value={type}
      options={types}
      onchange={(next) => isType(next) && (type = next)}
    />
    <TextField label="Title" bind:value={title} />
    <TextField label="Description" bind:value={description} />
    <div class="grid grid-cols-2 gap-3">
      <TextField label="Value" bind:value placeholder="+1 250 $" />
      <TextField label="Icon" bind:value={icon} placeholder="bank" />
    </div>
    <TextField label="Image URL" bind:value={image} placeholder="https://…" />
    <div class="sk-field">
      <span class="sk-field__label">Image mode</span>
      <Segmented
        label="Image mode"
        block
        value={imageMode}
        options={imageModes}
        onchange={(next) => isImageMode(next) && (imageMode = next)}
      />
    </div>
    <Select
      label="Position"
      value={position}
      placeholder="Default position"
      options={positions}
      onchange={(next) => isPosition(next) && (position = next)}
    />
    <Stepper label="Duration (s)" bind:value={duration} min={1} max={30} showMax={false} />

    <Button variant="primary" icon="bell" onclick={send}>Send</Button>

    <div class="sk-field">
      <span class="sk-field__label">Config</span>
      <Stepper
        label="Visible per position"
        value={store.config.maxVisiblePerPosition}
        min={1}
        max={10}
        showMax={false}
        onchange={(next) => store.setConfig({ maxVisiblePerPosition: next })}
      />
    </div>
    <Select
      label="Default position"
      value={store.config.defaultPosition}
      options={positions}
      onchange={(next) => isPosition(next) && store.setConfig({ defaultPosition: next })}
    />
    <div class="sk-field">
      <span class="sk-field__label">Identical notifications</span>
      <Segmented
        label="Identical notifications"
        block
        value={store.config.coalesce ? 'merge' : 'stack'}
        options={[
          { value: 'merge', label: 'Merged (×N)' },
          { value: 'stack', label: 'Stacked' },
        ]}
        onchange={(next) => store.setConfig({ coalesce: next === 'merge' })}
      />
    </div>

    <div class="sk-field">
      <span class="sk-field__label">Language</span>
      <Segmented
        label="Language"
        block
        value={locale.current}
        options={languages}
        onchange={(next) => locale.set(next)}
      />
    </div>
  </div>

  {#snippet actions()}
    <Button variant="primary" data-autofocus onclick={() => (open = false)}>Done</Button>
  {/snippet}
</Modal>
