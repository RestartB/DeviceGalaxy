<script lang="ts">
  import { goto } from '$app/navigation';

  import { deleteSpecField } from '#lib/remote/specs.remote.js';

  import CollapsibleSingle from '../ui/CollapsibleSingle.svelte';
  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';
  import SpecValueRow from './SpecValueRow.svelte';
  import { CircleAlert, Pencil, Trash } from '@lucide/svelte';

  import type { SpecWithValues } from '#lib/types/specs.js';

  const { spec }: { spec: SpecWithValues } = $props();

  let deleteOverlayOpen = $state(false);

  let errorOverlayOpen = $state(false);
  let errorMessage = $state('');
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
    onclick={() => (deleteOverlayOpen = true)}
  >
    <Trash />
  </button>
{/snippet}

{#if errorOverlayOpen}
  <FullscreenOverlay
    title="Error"
    Icon={CircleAlert}
    zIndex={70}
    bind:overlayOpen={errorOverlayOpen}
  >
    <p>{errorMessage}</p>
  </FullscreenOverlay>
{/if}

{#if deleteOverlayOpen}
  <FullscreenOverlay
    title="Delete Specification"
    Icon={Trash}
    gap={12}
    bind:overlayOpen={deleteOverlayOpen}
  >
    <p>
      Are you sure you want to delete this specification field (<i>{spec.name}</i>)? Devices with
      this value will not be deleted.
    </p>

    <button
      class="w-full cursor-pointer rounded-lg border border-zinc-200 bg-red-200 p-2 px-4 transition-colors hover:bg-red-300 dark:border-zinc-700 dark:bg-red-900 dark:hover:bg-red-800"
      title="Delete"
      onclick={async () => {
        try {
          await deleteSpecField(spec.id);
          await goto('/dash/specs', { refreshAll: true });
        } catch (error) {
          const errorDataRaw = String(error);

          try {
            const errorJson = JSON.parse(errorDataRaw);
            errorMessage =
              errorJson.message ||
              'An error occurred while deleting the specification value. Please try again later.';
          } catch {
            errorMessage =
              'An error occurred while deleting the specification value. Please try again later.';
          }

          errorOverlayOpen = true;
        }
      }}
    >
      Delete
    </button>
  </FullscreenOverlay>
{/if}

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
