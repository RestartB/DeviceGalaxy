<script lang="ts">
  import SpecRow from '#lib/components/specs/SpecRow.svelte';
  import Button from '#lib/components/ui/inputs/Button.svelte';
  import { Pencil, Search } from '@lucide/svelte';

  const { data } = $props();
  let overlayOpen = $state(false);
</script>

<div class="mb-4 flex items-center justify-center gap-2">
  <div
    class="mr-auto flex h-12 w-full max-w-160 items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-zinc-200 p-2 pr-4 pl-5 dark:border-zinc-700 dark:bg-zinc-800"
  >
    <input placeholder="Search fields..." class="w-full" />
    <button
      class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Search"
    >
      <Search size={22} />
    </button>
  </div>

  <div
    class="h-12 rounded-lg border border-zinc-300 bg-zinc-200 p-2 px-4 text-center text-nowrap dark:border-zinc-700 dark:bg-zinc-800"
  >
    <p>{data.specs.length} / <b>100</b></p>
  </div>

  <Button
    class="h-12 min-w-12 p-0! mob:min-w-fit mob:px-4!"
    title="Create specification field..."
    disabled={data.specs.length >= 100}
    onclick={() => {
      overlayOpen = true;
    }}
  >
    <Pencil class="shrink-0" />
  </Button>
</div>

<ul class="space-y-4">
  {#each data.specs as spec (spec.id)}
    <SpecRow {spec} />
  {/each}
</ul>
