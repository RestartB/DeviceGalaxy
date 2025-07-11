<script lang="ts">
	let { data } = $props();
	import Device from '$lib/components/Device.svelte';
</script>

<title>DeviceGalaxy - {data.device?.deviceName}</title>
<meta property="og:title" content={data.device?.deviceName} />
<meta
	name="description"
	content={data.device?.description || `View ${data.device?.deviceName} on DeviceGalaxy.`}
/>
<meta content="DeviceGalaxy" property="og:site_name" />

{#if data.device?.internalImages && data.device.internalImages.length > 0}
	<meta content="summary_large_image" name="twitter:card" />
	<meta property="og:image" content={data.device.internalImages[0]} />
{:else if data.device?.externalImages && data.device.externalImages.length > 0}
	<meta content="summary_large_image" name="twitter:card" />
	<meta property="og:image" content={data.device.externalImages[0]} />
{:else}
	<meta property="og:image" content="https://devices.restartb.xyz/favicon.png" />
{/if}

<Device {data} shareID={''} />
