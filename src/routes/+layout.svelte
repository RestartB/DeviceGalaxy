<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data, children } = $props();
</script>

<div class="font-family font-lg flex h-screen max-h-screen w-full">
	<Sidebar {data} />
	<div class="box-border h-full max-h-full flex-1 overflow-y-auto p-4">
		{@render children()}
	</div>
</div>
