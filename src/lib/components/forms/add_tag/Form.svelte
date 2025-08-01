<script lang="ts">
  import { fade } from 'svelte/transition';

  import { superForm } from 'sveltekit-superforms';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { newTagSchema } from '$lib/schema/newTag';

  import { toast } from 'svelte-sonner';
  import { X } from '@lucide/svelte';
  import Submit from '$lib/components/forms/Submit.svelte';

  type schemaType = typeof newTagSchema;

  let {
    sourceForm,
    createPopupOpen = $bindable(),
    refreshAll
  }: {
    sourceForm: SuperValidated<Infer<schemaType>>;
    createPopupOpen: boolean;
    refreshAll: any;
  } = $props();

  const { form, errors, allErrors, message, submitting, delayed, timeout, enhance } = superForm(
    sourceForm,
    {
      validators: zod4Client(newTagSchema),
      customValidity: false,
      invalidateAll: false,
      validationMethod: 'auto',
      id: 'newTagForm',
      delayMs: 1000,
      timeoutMs: 10000,

      onError: (error) => {
        console.error('Form submission error:', error);
        toast.error('Failed to create tag. Try again later.');
      }
    }
  );

  let hasErrors = $derived($allErrors.length > 0);

  $effect(() => {
    if ($message) {
      console.debug('Message from form:', $message);
      if ($message === 'Tag created successfully!') {
        toast.success($message as string);
        refreshAll();
        createPopupOpen = false;
      } else if (typeof $message === 'string' && $message) {
        toast.warning($message);
      }
    }
    $message = null;
  });

  $effect(() => {
    if ($timeout) {
      toast.error('Timed out while creating tag. Please try again.');
    }
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === 'Escape') {
      createPopupOpen = false;
    }
  }}
/>

{#if createPopupOpen}
  <div
    class="fixed inset-0 z-90 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-100"
      onclick={() => (createPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-110 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Create New Tag</h2>
        <button
          onclick={() => (createPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>

      <form method="POST" class="flex flex-col" action="/dash/tags?/newTag" use:enhance>
        <div class="flex flex-col gap-4 p-6">
          <label for="tagName" class="text-sm font-medium">Tag Name</label>
          <input
            type="text"
            id="tagName"
            name="tagName"
            class="w-full rounded-lg border p-2"
            bind:value={$form.tagName}
          />
          {#if $errors.tagName}<span class="text-red-600">{$errors.tagName}</span>{/if}

          <div class="flex items-center justify-between gap-4">
            <div>
              <label for="colourEnabled" class="text-sm font-medium">Custom Colour</label>
              <p class="text-sm text-zinc-400">
                To set a custom colour, check the box to the right.
              </p>
            </div>
            <input
              type="checkbox"
              id="colourEnabled"
              name="colourEnabled"
              class="h-6 w-6 cursor-pointer rounded-lg border p-2"
              bind:checked={$form.colourEnabled}
            />
          </div>
          {#if $errors.colourEnabled}<span class="text-red-600">{$errors.colourEnabled}</span>{/if}

          {#if $form.colourEnabled}
            <div>
              <label for="tagColour" class="text-sm font-medium">Tag Colour</label>
              <p class="text-sm text-zinc-400">
                Select a custom colour to be used for the tag's background. We will automatically
                decide the text colour based on the background colour you select.
              </p>
            </div>
            <input
              id="tagColour"
              name="colour"
              type="color"
              class="h-24 w-full rounded-lg border"
              bind:value={$form.colour}
            />
            {#if $errors.colour}<span class="text-red-600">{$errors.colour}</span>{/if}
          {/if}
        </div>
        <div class="border-t p-6">
          <Submit text="Add Tag" {hasErrors} submitting={$submitting} delayed={$delayed} />
        </div>
      </form>
    </div>
  </div>
{/if}
