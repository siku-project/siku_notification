<script lang="ts">
  import { flip } from 'svelte/animate'
  import { fade, fly } from 'svelte/transition'
  import { Badge, Toast } from '@siku/ui'
  import { m } from '@/lib/i18n.svelte'
  import { store } from '@/lib/notification/store.svelte'
  import { TONES, type NotificationPosition } from '@/lib/notification/types'

  interface Props {
    position: NotificationPosition
  }

  let { position }: Props = $props()

  const items = $derived(store.stackFor(position))
  const queued = $derived(store.queuedFor(position))
  const offset = $derived(position.startsWith('bottom') ? 8 : -8)
</script>

<div class="notification-stack notification-stack--{position}" aria-live="polite">
  {#each items as item (item.id)}
    <div
      class="notification-stack__item"
      animate:flip={{ duration: 320 }}
      in:fly={{ y: offset, duration: 320 }}
      out:fade={{ duration: 200 }}
    >
      <Toast
        title={item.title}
        body={item.description}
        value={item.value}
        icon={item.icon}
        tone={TONES[item.type]}
        image={item.image}
        imageMode={item.imageMode}
        count={item.count}
        duration={item.duration}
      />
    </div>
  {/each}

  {#if queued > 0}
    <div class="notification-stack__queued" transition:fade={{ duration: 200 }}>
      <Badge tone="neutral" icon="clock" label={m.notification_queued({ count: queued })} />
    </div>
  {/if}
</div>
