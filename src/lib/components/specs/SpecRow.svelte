<script lang="ts">
  import CollapsibleSingle from '../ui/CollapsibleSingle.svelte';
  import SpecValueRow from './SpecValueRow.svelte';
  import { Pencil, Trash } from '@lucide/svelte';

  import type { SpecWithValues } from '#lib/types/specs.js';

  const { spec }: { spec: SpecWithValues } = $props();
</script>

{#snippet collapsibleTitle()}
  <h3 class="mr-auto text-left font-bold">{spec.name}</h3>

  <button
    class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
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
{/snippet}

<li class="rounded-lg border border-zinc-300 bg-zinc-200 p-4 dark:border-zinc-700 dark:bg-zinc-800">
  <CollapsibleSingle title={spec.name} topRow={collapsibleTitle}>
    <ul class="flex flex-col gap-4">
      <li class="w-full">
        <hr class="border-zinc-300 dark:border-zinc-700" />
      </li>

      {#each spec.values as value (value.id)}
        <SpecValueRow {value} />
        <li class="w-full last:hidden">
          <hr class="border-zinc-300 dark:border-zinc-700" />
        </li>
      {/each}
    </ul>
  </CollapsibleSingle>
</li>
