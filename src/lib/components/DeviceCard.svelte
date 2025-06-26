<script lang="ts">
    const { background, name, brand, description } = $props();
</script>

<div
    class="flex-1 min-w-64 max-w-sm overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 shadow-md"
>
    <img src={background} alt={name} class="h-48 w-full object-cover" />
    <div class="p-4 w-full">
        <p class="text-sm text-zinc-600">{brand}</p>
        <h2 class="text-xl font-semibold">{name}</h2>
        <p class="text-sm text-zinc-600">{description}</p>
    </div>
</div>