<script lang="ts">
	let { data } = $props();
	import Devices from '$lib/components/Devices.svelte';
	import Device from '$lib/components/Device.svelte';

	console.log('Share data:', data);
</script>

<svelte:head>
	{#if data.share.type === 0}
		<title>DeviceGalaxy - Share {data.share.id}</title>
	{:else}
		<title>DeviceGalaxy</title>
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
