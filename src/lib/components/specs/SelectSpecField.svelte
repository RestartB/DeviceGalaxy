<script lang="ts">
  import { createSpecField } from '$lib/remote/specs.remote';

  import { List, Plus } from '@lucide/svelte';
  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';

  import type { specificationField } from '$lib/server/db/schema';

  let {
    fields,
    onSelect = () => {},
    overlayOpen = $bindable()
  }: {
    fields: (typeof specificationField.$inferSelect)[];
    onSelect?: (field: string) => void;
    overlayOpen: boolean;
  } = $props();
</script>

<FullscreenOverlay title="Select Field" Icon={List} zIndex={60} gap={8} bind:overlayOpen>
  <div class="flex items-center gap-2">
    <span class="shrink-0 pr-1 text-sm text-zinc-400 dark:text-zinc-500"> CREATE FIELD </span>
    <hr class="flex-1 text-zinc-300 dark:text-zinc-700" />
  </div>

  <form
    {...createSpecField.enhance(async (form) => {
      try {
        if (!(await form.submit()) || !createSpecField.result) {
          return;
        }

        form.element.reset();
        onSelect(createSpecField.result.id);
        overlayOpen = false;
      } catch (error) {
        console.error(error);
      }
    })}
    class="mb-2 flex w-full items-center justify-center gap-2"
  >
    <input
      class="min-w-35 flex-1 rounded-lg border-2 border-zinc-300 bg-zinc-200 p-1 px-2 dark:border-zinc-600 dark:bg-zinc-700"
      placeholder="Enter field name..."
      {...createSpecField.fields.name.as('text')}
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
    <span class="shrink-0 pr-1 text-sm text-zinc-400 dark:text-zinc-500"> SELECT FIELD </span>
    <hr class="flex-1 text-zinc-300 dark:text-zinc-700" />
  </div>

  {#if fields.length > 0}
    {#each fields as field (field.key)}
      <button
        class="w-full cursor-pointer rounded-lg p-2 text-start transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
        onclick={() => {
          onSelect(field.id);
          overlayOpen = false;
        }}
      >
        <p>{field.name}</p>
      </button>
    {/each}
  {:else}
    <p class="text-zinc-500 dark:text-zinc-400">No fields found</p>
  {/if}
</FullscreenOverlay>
