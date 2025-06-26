<script lang="ts">
	import { authClient } from '$lib/client';
	import type { LayoutData } from '../../routes/$types';
    import { goto } from '$app/navigation';

	// Get session from props
	let { data }: { data: LayoutData } = $props();
</script>

<header
	class="box-border flex h-full w-full max-w-60 flex-col items-center gap-4 border-r-4 border-zinc-300 bg-zinc-200 p-4"
>
	<h1 class="text-xl font-bold w-full">myDevices</h1>
	<nav class="w-full">
		<ul class="flex flex-col gap-4 w-full">
			<li class="w-full"><a href="/" class="w-full">Home</a></li>
			<li class="w-full"><a href="/devices" class="w-full">Devices</a></li>
			<li class="w-full"><a href="/software" class="w-full">Software</a></li>
			<li class="w-full"><a href="/shared" class="w-full">Shared</a></li>
		</ul>
	</nav>

	<div class="mt-auto">
		{#if data.user}
			<p>{data.user.name}</p>
			<button class="mt-2" onclick={() => {
                authClient.signOut();
                goto('/auth/login');
            }}>Sign Out</button>
		{:else}
			<p>Not signed in</p>
		{/if}
	</div>
</header>
