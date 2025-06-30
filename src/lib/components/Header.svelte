<script lang="ts">
	import { authClient } from '$lib/client';
	import type { LayoutData } from '../../routes/$types';
	import { goto } from '$app/navigation';

	// Get session from props
	let { data }: { data: LayoutData } = $props();
</script>

<header
	class="fixed z-50 box-border flex h-12 w-full items-center justify-center gap-4 border-b-4 border-zinc-300 bg-zinc-200 px-4"
>
	<h1 class="p-2 pr-0 text-xl font-bold">myDevices</h1>
	<nav class="flex h-full items-center justify-center">
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100"
			href="/">Home</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100"
			href="/devices">Devices</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100"
			href="/software">Specifications</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100"
			href="/shared">Shared</a
		>
	</nav>

	<div class="ml-auto flex gap-2">
		{#if data.user}
			<p>{data.user.name}</p>
			<!-- <button
				class="mt-2"
				onclick={() => {
					authClient.signOut();
					goto('/auth/login');
				}}>Sign Out</button
			> -->
		{:else}
			<p>Not signed in</p>
		{/if}
	</div>
</header>
