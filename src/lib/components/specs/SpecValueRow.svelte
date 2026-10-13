<script lang="ts">
  import { Eye, Pencil, Trash } from '@lucide/svelte';
  import type { specificationValue } from '#lib/server/db/schema.js';

  const { value }: { value: typeof specificationValue.$inferSelect } = $props();
</script>

<li class="flex items-center justify-center gap-2">
  <p>{value.value}</p>

  <button
    class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
    onclick={(e) => {
      e.stopPropagation();
    }}
  >
    <Pencil />
  </button>
  <button
    class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
    onclick={(e) => {
      e.stopPropagation();
    }}
  >
    <Trash />
  </button>
  <a
    class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
    href="/dash/devices?specVal={encodeURIComponent(value.id)}"
    title="View devices with {value.value}"
  >
    <Eye />
  </a>
</li>
