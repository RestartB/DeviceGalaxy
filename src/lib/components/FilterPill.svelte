<script lang="ts">
	const { name, options } = $props();
    let dropdownOpen = $state(false);
</script>

<div class="relative">
    <button class="flex items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2" onclick={() => (dropdownOpen = !dropdownOpen)}>
        <p>{name}</p>
    </button>

    {#if dropdownOpen}
        <div class="absolute z-10 mt-2 rounded-lg bg-zinc-100 border-2 border-zinc-400 w-40 h-60">
            <ul class="">
                {#each options as option}
                    <li>{option}</li>
                {/each}
            </ul>
        </div>
    {/if}
</div>