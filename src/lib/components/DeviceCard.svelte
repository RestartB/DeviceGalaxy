<script lang="ts">
    import { Cpu, MemoryStick, HardDrive } from '@lucide/svelte';
    const { name, description, brand, cpu, memory, storage, background} = $props();
</script>

<div
    class="flex-1 min-w-64 max-w-sm overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md"
>
    <img src={background} alt={name} class="h-48 w-full object-cover" />
    <div class="p-4 w-full flex flex-col gap-2">
        <div>
            <p class="text-sm text-zinc-600">{brand}</p>
            <h2 class="text-xl font-semibold">{name}</h2>
            <p>{description}</p>
        </div>

        <div class="flex w-full flex-wrap text-sm gap-1">
            {#if cpu}
                <div class="w-fit h-fit p-2 px-4 rounded-full bg-zinc-100 border-2 border-zinc-400 flex items-center justify-center gap-2">
                    <Cpu size=20 />
                    <p>{cpu}</p>
                </div>
            {/if}
            {#if memory}
                <div class="w-fit h-fit p-2 px-4 rounded-full bg-zinc-100 border-2 border-zinc-400 flex items-center justify-center gap-2">
                    <MemoryStick size=20 />
                    <p>{memory}</p>
                </div>
            {/if}
            {#if storage}
                <div class="w-fit h-fit p-2 px-4 rounded-full bg-zinc-100 border-2 border-zinc-400 flex items-center justify-center gap-2">
                    <HardDrive size=20 />
                    <p>{storage}</p>
                </div>
            {/if}
        </div>
    </div>
</div>