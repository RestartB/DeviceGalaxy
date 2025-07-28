<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { editDescriptionSchema } from '$lib/schema/editDescription';

  import { toast } from 'svelte-sonner';
  import { Save, RefreshCw } from '@lucide/svelte';

  type schemaType = typeof editDescriptionSchema;

  let {
    sourceForm,
    oldDescription
  }: {
    sourceForm: SuperValidated<Infer<schemaType>>;
    oldDescription: string | null;
  } = $props();

  const { form, errors, allErrors, message, submitting, timeout, enhance } = superForm(sourceForm, {
    validators: zod4Client(editDescriptionSchema),
    customValidity: false,
    invalidateAll: false,
    validationMethod: 'auto',
    delayMs: 1000,
    timeoutMs: 6000,

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to update description. Try again later.');
    }
  });

  $form.description = oldDescription || '';
  let hasErrors = $derived($allErrors.length > 0);

  $effect(() => {
    if ($message) {
      console.debug('Message from form:', $message);
      if ($message === 'Description updated successfully!') {
        window.location.reload();
      } else if (typeof $message === 'string' && $message) {
        toast.warning($message);
      }
    }
    $message = null;
  });

  $effect(() => {
    if ($timeout) {
      toast.error('Timed out while updating description. Please try again.');
    }
  });
</script>

<form class="flex flex-col gap-2" action="?/updateDescription" method="POST" use:enhance>
  <textarea
    class="w-full max-w-lg rounded-lg border p-2"
    placeholder="Add a description..."
    name="description"
    rows="3"
    bind:value={$form.description}
  ></textarea>

  {#if $errors.description}
    <p class="text-sm text-red-500">{$errors.description}</p>
  {/if}
  {#if $errors._errors}
    <p class="text-sm text-red-500">{$errors._errors}</p>
  {/if}

  {#if $form.description !== oldDescription}
    <div class="flex items-center gap-2">
      <button
        class="h-10.5 w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-200 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600 dark:disabled:hover:bg-green-700"
        aria-label="Save Description"
        type="submit"
        disabled={$submitting || hasErrors}
      >
        <Save size="20" />
      </button>
      <button
        class="h-10.5 w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 disabled:hover:dark:bg-zinc-700"
        aria-label="Reset Description"
        disabled={$submitting}
        onclick={() => {
          $form.description = oldDescription || '';
        }}
      >
        <RefreshCw size="20" />
      </button>
    </div>
  {/if}
</form>
