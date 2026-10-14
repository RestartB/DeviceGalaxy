<script lang="ts">
  import { goto } from '$app/navigation';

  import { deleteSpecValue } from '#lib/remote/specs.remote.js';

  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';
  import { CircleAlert, Eye, Pencil, Trash } from '@lucide/svelte';

  import type { specificationValue } from '#lib/server/db/schema.js';

  const { value }: { value: typeof specificationValue.$inferSelect } = $props();

  let deleteOverlayOpen = $state(false);

  let errorOverlayOpen = $state(false);
  let errorMessage = $state('');
</script>

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
      Are you sure you want to delete this specification value (<i>{value.value}</i>)? Devices with
      this value will not be deleted.
    </p>

    <button
      class="w-full cursor-pointer rounded-lg border border-zinc-200 bg-red-200 p-2 px-4 transition-colors hover:bg-red-300 dark:border-zinc-700 dark:bg-red-900 dark:hover:bg-red-800"
      title="Delete"
      onclick={async () => {
        try {
          await deleteSpecValue(value.id);
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

<li class="flex items-center justify-center gap-2">
  <p>{value.value}</p>

  <button
    class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
  >
    <Pencil />
  </button>
  <button
    class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
    onclick={() => (deleteOverlayOpen = true)}
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
