<script lang="ts">
    let { 
		fuzzyResults, 
		errors, 
		value = $bindable() 
	}: { 
		fuzzyResults: any; 
		errors: any; 
		value: string
	} = $props();
    
    let focus = $state(false);
</script>

<label for="memory" class="text-sm font-medium">Memory</label>
<div class="relative">
	<input
		type="text"
		id="memory"
		name="memory"
		class="w-full rounded-lg border p-2"
		bind:value
		onfocusin={() => (focus = true)}
		onfocusout={() => (focus = false)}
	/>
	{#if fuzzyResults && value && focus}
		<ul
			class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
		>
			{#each fuzzyResults.search(value) as result}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="cursor-pointer px-4 py-2 hover:bg-zinc-200"
					onclick={() => (value = result.item.displayName)}
				>
					{result.item.displayName}
				</li>
			{/each}
		</ul>
	{/if}
</div>
{#if $errors.memory}<span class="text-red-600">{$errors.memory}</span>{/if}
