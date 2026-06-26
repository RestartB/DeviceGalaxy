<script lang="ts">
  import Device from '$lib/components/devices/Device.svelte';
  import Button from '$lib/components/ui/inputs/Button.svelte';

  let overlayOpen = $state(false);
</script>

{#if overlayOpen}
  <Device bind:overlayOpen />
{/if}

<Button
  onclick={() => {
    overlayOpen = true;
  }}
>
  <p>Open overlay</p>
</Button>
