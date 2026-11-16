<script lang="ts">
  import NotificationAnchor from '@/components/notification/NotificationAnchor.svelte'
  import NotificationStack from '@/components/notification/NotificationStack.svelte'
  import { POSITIONS } from '@/lib/notification/types'
</script>

{#each POSITIONS as position (position)}
  <NotificationAnchor {position}>
    <NotificationStack {position} />
  </NotificationAnchor>
{/each}
