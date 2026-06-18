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
      <meta property="og:site_name" content="DeviceGalaxy" />

      <meta
        name="description"
        content={data.shareUser.description
          ? data.shareUser.description
          : `View ${data.shareUser.name}'s shared devices on DeviceGalaxy.`}
      />
      <meta
        property="og:description"
        content={data.shareUser.description
          ? data.shareUser.description
          : `View ${data.shareUser.name}'s shared devices on DeviceGalaxy.`}
      />

      <meta
        property="og:image"
        content={data.shareUser.image
          ? data.shareUser.image
          : 'https://devicegalaxy.me/favicon.png'}
      />
    {:else if data.share.type === 2 && data.device}
      <meta name="twitter:card" content="tweet" />
      <link
        type="application/activity+json"
        href="{page.url.origin}/users/{data.shareUser.name}/statuses/{statusId}"
      />

      <meta property="og:title" content="{data.device.deviceName} (@{data.shareUser.name})" />
      <meta property="og:description" content={data.device.description} />
      <meta name="description" content={data.device.description} />

      <meta property="og:image" content="" />
      <meta name="twitter:image" content={data.shareUser.image} />
      <meta name="twitter:creator" content="@" />
    {:else}
      <title>DeviceGalaxy - Share</title>
      <meta property="og:title" content="{data.shareUser.name}'s Share" />
      <meta property="og:site_name" content="DeviceGalaxy" />

      <meta
        name="description"
        content="View {data.shareUser.name}'s shared devices on DeviceGalaxy."
      />
      <meta
        property="og:description"
        content="View {data.shareUser.name}'s shared devices on DeviceGalaxy."
      />
      
      <meta
        property="og:image"
        content={data.shareUser.image
          ? data.shareUser.image
          : 'https://devicegalaxy.me/favicon.png'}
      />
    {/if}
  {/if}
</svelte:head>

{#if data.share.type === 0}
  <div class="w-full p-4">
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
