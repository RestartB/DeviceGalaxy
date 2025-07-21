<script lang="ts">
	let { data } = $props();
	import Devices from '$lib/components/Devices.svelte';
</script>

<svelte:head>
	<title>DeviceGalaxy - Devices</title>
</svelte:head>

<Devices {data} shareID={''} />
