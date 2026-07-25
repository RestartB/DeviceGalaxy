<script lang="ts">
  import Device from '$lib/components/devices/Device.svelte';
  import FullscreenOverlay from '$lib/components/ui/FullscreenOverlay.svelte';
  import Button from '$lib/components/ui/inputs/Button.svelte';

  let overlayOpen = $state(false);
  let normalOverlayOpen = $state(false);
</script>

{#if overlayOpen}
  <Device bind:overlayOpen />
{/if}

{#if normalOverlayOpen}
  <FullscreenOverlay bind:overlayOpen={normalOverlayOpen} title="test">
    <p>this is a test</p>
  </FullscreenOverlay>
{/if}

<Button
  onclick={() => {
    overlayOpen = true;
  }}
>
  <p>Open device overlay</p>
</Button>

<Button
  onclick={() => {
    normalOverlayOpen = true;
  }}
>
  <p>Open normal overlay</p>
</Button>
