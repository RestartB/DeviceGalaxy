<script lang="ts">
	import { authClient } from '$lib/client';
	import type { LayoutData } from '../../routes/$types';
	import { goto } from '$app/navigation';

	import Avatar from '$lib/components/Avatar.svelte';

	// Get session from props
	let { data }: { data: LayoutData } = $props();
</script>

<header
	class="fixed z-1000 box-border flex h-12 w-full items-center justify-center gap-4 border-b-4 border-zinc-300 bg-zinc-200 px-4 dark:border-zinc-700 dark:bg-zinc-800"
>
	<h1 class="p-2 pr-0 text-xl font-bold">myDevices</h1>
	<nav class="flex h-full items-center justify-center">
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
			href="/">Home</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
			href="/devices">Devices</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
			href="/tags">Tags</a
		>
		<a
			class="flex h-full items-center justify-center rounded-lg px-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
			href="/shared">Shared</a
		>
	</nav>

	<div class="ml-auto flex items-center justify-center gap-2">
		{#if data.user}
			<Avatar
				size={30}
				src={data.user.image || ''}
				name={data.user.name || ''}
				alt="User Avatar"
				className="border-zinc-400"
			/>
			<p class="font-bold">{data.user.name}</p>
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
