<script lang="ts">
	let { data } = $props();
	import Device from '$lib/components/Device.svelte';
</script>

<svelte:head>
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
</svelte:head>

<Device {data} shareID={data.share.id} />
