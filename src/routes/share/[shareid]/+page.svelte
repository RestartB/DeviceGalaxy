<script lang="ts">
  let { data } = $props();

  import { page } from '$app/state';
  import Devices from '$lib/components/Devices.svelte';
  import Device from '$lib/components/Device.svelte';

  const utf8Arr = new TextEncoder().encode(`${data.share.id}-${data.device?.id}`);
  const base64Encoded = btoa(String.fromCharCode(...utf8Arr));
  const statusId = base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
</script>

<svelte:head>
  {#if data.shareUser}
    {#if data.share.type === 0}
      <title>DeviceGalaxy - Share</title>
      <meta property="og:title" content="{data.shareUser.name}'s Share" />
      <meta
        name="og:description"
        content={data.shareUser.description
          ? data.shareUser.description
          : `View ${data.shareUser.name}'s shared devices on DeviceGalaxy.`}
      />
      <meta content="DeviceGalaxy" property="og:site_name" />
      <meta property="og:image" content="https://devicegalaxy.me/favicon.png" />
    {:else if data.share.type === 2 && data.device}
      <meta property="og:image" content="" />
      <meta name="twitter:card" content="tweet" />

      <meta name="og:title" content="{data.device.deviceName} (@{data.shareUser.name})" />
      <link
        type="application/activity+json"
        href="{page.url.origin}/users/{data.shareUser.name}/statuses/{statusId}"
      />

      <meta name="twitter:image" content={data.shareUser.image} />
      <meta name="twitter:creator" content="@" />

      <meta property="og:description" content={data.device.description} />
    {:else}
      <title>DeviceGalaxy - Share</title>
      <meta property="og:title" content="{data.shareUser.name}'s Share" />
      <meta
        name="og:description"
        content="View {data.shareUser.name}'s shared devices on DeviceGalaxy."
      />
      <meta content="DeviceGalaxy" property="og:site_name" />
      <meta property="og:image" content="https://devicegalaxy.me/favicon.png" />
    {/if}
  {/if}
</svelte:head>

{#if data.share.type === 0}
  <div class="p-4">
    <Devices {data} shareID={data.share.id} />
  </div>
{:else if data.share.type === 1}
  <p>
    Not implemented yet. You should not see this message, please create an issue in the GitHub repo
    - https://github.com/restartb/devicegalaxy
  </p>
{:else if data.share.type === 2}
  <Device {data} shareID={data.share.id} />
{:else}
  <p>
    Invalid share type. You should not see this message, please create an issue in the GitHub repo -
    https://github.com/restartb/devicegalaxy
  </p>
{/if}
