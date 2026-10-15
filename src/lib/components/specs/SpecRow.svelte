<script lang="ts">
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';

  import { deleteSpecField, editSpecField } from '#lib/remote/specs.remote.js';
  import { editSpecFieldSchema } from '#lib/schema/spec.js';

  import CollapsibleSingle from '../ui/CollapsibleSingle.svelte';
  import FullscreenOverlay from '../ui/FullscreenOverlay.svelte';
  import SpecValueRow from './SpecValueRow.svelte';
  import { CircleAlert, Pencil, Save, Trash, X } from '@lucide/svelte';

  import type { SpecWithValues } from '#lib/types/specs.js';

  const { spec }: { spec: SpecWithValues } = $props();

  let editMode = $state(false);
  let editForm = $derived(editSpecField.for(`name-${spec.id}`));
  let editBox: HTMLInputElement | undefined = $state();
  let deleteOverlayOpen = $state(false);

  let errorOverlayOpen = $state(false);
  let errorMessage = $state('');
</script>

{#snippet collapsibleTitle()}
  {#if editMode}
    <form
      class="flex-1"
      id="name-{spec.id}"
      {...editForm.preflight(editSpecFieldSchema).enhance(async () => {
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
          <input {...editForm.fields.fieldId.as('hidden', spec.id)} />

          <!-- svelte-ignore a11y_autofocus -->
          <input
            class="w-full border-b-2 border-zinc-300 text-left font-bold transition-all dark:border-zinc-700"
            placeholder="Enter name..."
            autofocus
            bind:this={editBox}
            {...editForm.fields.name.as('text', spec.name)}
          />
        </div>
        {#each editForm.fields.allIssues() as issue (issue.message)}
          <p class="text-red-600 dark:text-red-400">{issue.message}</p>
        {/each}
      </div>
    </form>
  {:else}
    <h3 class="text-left font-bold">{spec.name}</h3>
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
      form="name-{spec.id}"
    >
      <Save />
    </button>
  {:else}
    <button
      class="ml-auto cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
      title="Edit name"
      onclick={async () => {
        editForm.fields.name.set(spec.name);
        editMode = true;
      }}
    >
      <Pencil />
    </button>
  {/if}

  <button
    class="cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700"
    title="Delete field"
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
      <li class="w-full" transition:fade={{ duration: 300 }}>
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
