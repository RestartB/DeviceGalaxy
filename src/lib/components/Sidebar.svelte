<script lang="ts">
	import { authClient } from '$lib/client';
	import type { PageProps } from '../../routes/$types';

	// Get session from props
	const { data }: PageProps = $props();
</script>

<header
	class="box-border flex h-full w-fit flex-col items-center gap-4 border-r-4 border-zinc-300 bg-zinc-200 p-4"
>
	<h1 class="text-3xl font-bold">myDevices</h1>
	<nav>
		<ul class="flex flex-col gap-4">
			<li><a href="/">Home</a></li>
			<li><a href="/about">About</a></li>
			<li><a href="/selfhost">Selfhost</a></li>
			<li><a href="/dash">Dashboard</a></li>
		</ul>
	</nav>

	<div class="mt-auto">
		{#if data.user}
			<p>{data.user.name}</p>
			<button class="mt-2" onclick={() => authClient.signOut()}>Sign Out</button>
		{:else}
			<p>Not signed in</p>
		{/if}
	</div>
</header>
