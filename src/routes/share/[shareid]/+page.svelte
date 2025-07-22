<script lang="ts">
  let { data } = $props();

  import Devices from '$lib/components/Devices.svelte';
  import Device from '$lib/components/Device.svelte';
</script>

<svelte:head>
  {#if data.shareUser}
    {#if data.share.type === 0}
      <title>DeviceGalaxy - {data.shareUser.name}'s devices</title>
      <meta property="og:title" content="{data.shareUser.name}'s devices" />
      <meta
        name="og:description"
        content="View {data.shareUser.name}'s shared devices on DeviceGalaxy."
      />
      <meta content="DeviceGalaxy" property="og:site_name" />

      {#if data.shareUser.image}
        <meta property="og:image" content={data.shareUser.image} />
      {:else}
        <meta property="og:image" content="https://devices.restartb.xyz/favicon.png" />
      {/if}
    {:else if data.share.type === 2}
      <title>DeviceGalaxy - {data.device?.deviceName}</title>
      <meta property="og:title" content={data.device?.deviceName} />
      <meta
        name="og:description"
        content={data.device?.description || `View ${data.device?.deviceName} on DeviceGalaxy.`}
      />
      <meta content="DeviceGalaxy" property="og:site_name" />

      {#if data.device?.internalImages && data.device.internalImages.length > 0}
        <meta content="summary_large_image" name="twitter:card" />
        <meta
          property="og:image"
          content="{data.baseURL}/api/image/device/{data.device.id}/{data.device
            .internalImages[0]}?share={data.share.id}"
        />
      {:else if data.device?.externalImages && data.device.externalImages.length > 0}
        <meta content="summary_large_image" name="twitter:card" />
        <meta property="og:image" content={data.device.externalImages[0]} />
      {:else}
        <meta property="og:image" content="https://devices.restartb.xyz/favicon.png" />
      {/if}
    {:else}
      <title>DeviceGalaxy - Share</title>
      <meta property="og:title" content="{data.shareUser.name}'s Share" />
      <meta
        name="og:description"
        content="View {data.shareUser.name}'s shared devices on DeviceGalaxy."
      />
      <meta content="DeviceGalaxy" property="og:site_name" />
      <meta property="og:image" content="https://devices.restartb.xyz/favicon.png" />
    {/if}
  {/if}
</svelte:head>

{#if data.share.type === 0}
  <div class="p-4">
    <Devices {data} shareID={data.share.id} />
  </div>
{:else if data.share.type === 1}
  <p>Placeholder</p>
{:else if data.share.type === 2}
  <Device {data} shareID={data.share.id} />
{:else}
  <p>
    Invalid share type. You should not see this message, please create an issue in the GitHub repo -
    https://github.com/restartb/devicegalaxy
  </p>
{/if}
