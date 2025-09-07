<script lang="ts">
  let { data } = $props();

  import { page } from '$app/state';
  import Device from '$lib/components/Device.svelte';

  const utf8Arr = new TextEncoder().encode(`${data.share.id}-${data.device?.id}`);
  const base64Encoded = btoa(String.fromCharCode(...utf8Arr));
  const statusId = base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
</script>

<svelte:head>
  {#if data.shareUser && data.device}
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
  {/if}
</svelte:head>

<Device {data} shareID={data.share.id} />
