<script lang="ts">
	let { data } = $props();
	import Device from '$lib/components/Device.svelte';
</script>

<svelte:head>
	<title>DeviceGalaxy - {data.device?.deviceName}</title>
</svelte:head>

<Device {data} shareID={''} />
