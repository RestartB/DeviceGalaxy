<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<div class="absolute w-full h-fit top-0 left-0 z-50">
	<Header />
</div>

<div class="mt-[42px]">
	{@render children()}
</div>
