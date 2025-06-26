<script lang="ts">
	// Get session from props
	const { data } = $props();

	import Avatar from '$lib/components/Avatar.svelte';
	import DeviceCard from '$lib/components/DeviceCard.svelte';
</script>

{#if data.user}
	<h1 class="text-4xl font-bold">Home</h1>
	<div class="flex items-center gap-4">
		<Avatar
			size={40}
			src={data.user.image || ''}
			name={data.user.name || ''}
			alt="User Avatar"
			className="border-zinc-400"
		/>
		<div>
			<h1 class="text-lg font-semibold">Welcome back, {data.user.name}!</h1>
		</div>
	</div>
	<div class="flex w-full flex-wrap gap-2">

	</div>
{/if}
