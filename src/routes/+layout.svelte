<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Toaster } from 'svelte-sonner';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();
</script>

<div class="font-family font-lg h-screen max-h-screen w-full">
	<Header {data} />
	<div
		class="box-border h-full max-h-full flex-1 overflow-y-auto p-4 pt-16"
		class:p-4={!page.url.pathname.startsWith('/device/')}
		class:pt-12={page.url.pathname.startsWith('/device/')}
		class:pt-16={!page.url.pathname.startsWith('/device/')}
	>
		<Toaster position="top-center" richColors closeButton />
		{@render children()}
	</div>
</div>
