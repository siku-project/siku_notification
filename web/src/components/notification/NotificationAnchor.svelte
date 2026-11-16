<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { NotificationPosition } from '@/lib/notification/types'

  interface Props {
    position: NotificationPosition
    children: Snippet
  }

  let { position, children }: Props = $props()
</script>

<div class="notification-anchor notification-anchor--{position}">
  {@render children()}
</div>
