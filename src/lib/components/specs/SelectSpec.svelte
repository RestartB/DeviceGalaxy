<script lang="ts">
  import { createSpecValue } from '#lib/remote/specs.remote.js';

  import { List, Plus } from '@lucide/svelte';
  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';

  import type { specificationValue } from '#lib/server/db/schema.js';

  let {
    fieldId,
    values,
    onSelect = () => {},
    overlayOpen = $bindable()
  }: {
    fieldId: string;
    values: (typeof specificationValue.$inferSelect)[];
    onSelect?: (field: string) => void;
    overlayOpen: boolean;
  } = $props();
</script>

<FullscreenOverlay title="Select Field Value" Icon={List} zIndex={60} gap={8} bind:overlayOpen>
  <div class="flex items-center gap-2">
    <span class="shrink-0 pr-1 text-sm text-zinc-400 dark:text-zinc-500"> CREATE SPEC </span>
    <hr class="flex-1 text-zinc-300 dark:text-zinc-700" />
  </div>

  <form
    {...createSpecValue.enhance(async (form) => {
      try {
        if (!(await form.submit()) || !createSpecValue.result) {
          return;
        }

        form.element.reset();
        onSelect(createSpecValue.result.id);
        overlayOpen = false;
      } catch (error) {
        console.error(error);
      }
    })}
    class="mb-2 flex w-full items-center justify-center gap-2"
  >
    <input type="hidden" {...createSpecValue.fields.fieldId.as('text')} value={fieldId} />
    <input
      class="min-w-35 flex-1 rounded-lg border-2 border-zinc-300 bg-zinc-200 p-1 px-2 dark:border-zinc-600 dark:bg-zinc-700"
      placeholder="Enter value..."
      {...createSpecValue.fields.value.as('text')}
    />
    <button
      type="submit"
      class="flex h-full cursor-pointer items-center justify-center rounded-lg border-2 border-zinc-300 bg-zinc-200 p-1 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-500"
      title="Create Field"
    >
      <Plus size={28} />
    </button>
  </form>

  <div class="flex items-center gap-2">
    <span class="shrink-0 pr-1 text-sm text-zinc-400 dark:text-zinc-500"> SELECT SPEC </span>
    <hr class="flex-1 text-zinc-300 dark:text-zinc-700" />
  </div>

  {#if values.length > 0}
    {#each values as value (value.id)}
      <button
        class="w-full cursor-pointer rounded-lg p-2 text-start transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
        onclick={() => {
          onSelect(value.id);
          overlayOpen = false;
        }}
      >
        <p>{value.value}</p>
      </button>
    {/each}
  {:else}
    <p class="text-zinc-500 dark:text-zinc-400">No items found</p>
  {/if}
</FullscreenOverlay>
