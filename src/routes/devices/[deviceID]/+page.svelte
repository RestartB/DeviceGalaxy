<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Device from '#lib/components/devices/Device.svelte';

  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // this fixes the animation breaking when navigating fresh to a device page
  let overlayOpen = $state(false);
  onMount(() => (overlayOpen = true));
</script>

<noscript>
  <Device existingDevice={data.device} specFields={data.specFields} overlayOpen={true} />
</noscript>

{#if overlayOpen}
  <Device
    existingDevice={data.device}
    specFields={data.specFields}
    bind:overlayOpen
    onClose={() => goto('/devices')}
  />
{/if}
