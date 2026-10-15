<script lang="ts">
  import { goto } from '$app/navigation';

  import { deleteSpecValue, editSpecValue } from '#lib/remote/specs.remote.js';
  import { editSpecValueSchema } from '#lib/schema/spec.js';

  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';
  import { CircleAlert, Eye, Pencil, Save, Trash, X } from '@lucide/svelte';

  import type { specificationValue } from '#lib/server/db/schema.js';

  const { value }: { value: typeof specificationValue.$inferSelect } = $props();

  let editMode = $state(false);
  let editForm = $derived(editSpecValue.for(`vname-${value.id}`));
  let editBox: HTMLInputElement | undefined = $state();
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
  {#if editMode}
    <form
      class="flex-1"
      id="vname-{value.id}"
      {...editForm.preflight(editSpecValueSchema).enhance(async () => {
        try {
          if (!(await editForm.submit()) || !editForm.result?.success) {
            return;
          }

          editForm.element?.reset();
          editMode = false;
        } catch (error) {
          console.error(error);
          errorMessage = String(error);
          errorOverlayOpen = true;
        }
      })}
    >
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <input {...editForm.fields.fieldId.as('hidden', value.fieldId)} />
          <input {...editForm.fields.valueId.as('hidden', value.id)} />

          <!-- svelte-ignore a11y_autofocus -->
          <input
            class="w-full border-b-2 border-zinc-300 text-left transition-all dark:border-zinc-700"
            placeholder="Enter name..."
            autofocus
            bind:this={editBox}
            {...editForm.fields.value.as('text', value.value)}
          />
        </div>
        {#each editForm.fields.allIssues() as issue (issue.message)}
          <p class="text-red-600 dark:text-red-400">{issue.message}</p>
        {/each}
      </div>
    </form>
  {:else}
    <h3 class="text-left">{value.value}</h3>
  {/if}

  {#if editMode}
    <button
      class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Exit edit mode"
      onclick={() => {
        editForm.element?.reset();
        editMode = false;
      }}
    >
      <X />
    </button>
    <button
      class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Save new name"
      type="submit"
      form="vname-{value.id}"
    >
      <Save />
    </button>
  {:else}
    <button
      class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Edit name"
      onclick={async () => {
        editForm.fields.value.set(value.value);
        editMode = true;
      }}
    >
      <Pencil />
    </button>
  {/if}

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
