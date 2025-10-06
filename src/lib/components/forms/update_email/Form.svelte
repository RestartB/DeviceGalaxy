<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm } from 'sveltekit-superforms/client';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { updateEmailSchema } from '$lib/schema/updateEmail';

  import { Pencil, X } from '@lucide/svelte';

  const {
    sourceForm,
    user
  }: { sourceForm: SuperValidated<Infer<typeof updateEmailSchema>>; user: any } = $props();

  const { form, message, errors, allErrors, enhance } = superForm(sourceForm, {
    validators: zod4Client(updateEmailSchema),
    customValidity: false,
    validationMethod: 'auto',

    onSubmit: ({ cancel }) => {
      if ($form.email === user?.email) {
        toast.error('Please enter a new email address.');
        cancel();
      }
    },

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to update email. Try again later.');
    }
  });

  $form.email = user?.email || '';

  $effect(() => {
    if ($message === 'Updated') {
      window.location.reload();
    }
  });

  let emailPopupOpen = $state(false);
</script>

{#if emailPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (emailPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Change Email Address</h2>
        <button
          onclick={() => (emailPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <form action="?/updateEmail" method="POST" use:enhance>
        <div class="flex flex-col gap-4 p-6">
          <label for="email" class="text-sm font-medium">New Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            class="w-full rounded-lg border p-2"
            placeholder={'Enter new email...'}
            bind:value={$form.email}
          />

          {#if $errors.email}
            {#each $errors.email as error}
              <p class="text-sm text-red-500">{error}</p>
            {/each}
          {/if}
          {#if $errors._errors}
            {#each $errors._errors as error}
              <p class="text-sm text-red-500">{error}</p>
            {/each}
          {/if}
        </div>
        <div class="border-t p-6">
          <button
            type="submit"
            class="w-full cursor-pointer rounded-md bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-500"
            disabled={$form.email === user?.email || $allErrors.length > 0}
            >Change Email Address</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<button
  class="flex w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
  onclick={() => (emailPopupOpen = true)}
>
  <Pencil size="20" />
  Edit
</button>
