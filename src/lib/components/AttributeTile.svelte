<script lang="ts">
  const { name, icon: Icon, children } = $props();
</script>

<div class="rounded-lg border-2 border-zinc-400 bg-zinc-200 p-4 shadow-md dark:bg-zinc-700">
  <div class="flex items-center gap-2">
    <Icon />
    <h2 class="text-xl font-bold" translate="no">{name}</h2>
  </div>
  <p>{@render children()}</p>
</div>
