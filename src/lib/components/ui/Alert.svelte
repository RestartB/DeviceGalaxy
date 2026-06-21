<script lang="ts">
  import { TriangleAlert } from '@lucide/svelte';
  const { children, class: className = '' } = $props();
</script>

<div class="flex items-center gap-4 rounded-xl border-2 border-zinc-700 bg-red-800/30 p-4 {className}">
  <TriangleAlert size={20} class="shrink-0" />
  {@render children?.()}
</div>
