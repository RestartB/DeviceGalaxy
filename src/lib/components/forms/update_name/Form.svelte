<script lang="ts">
  import { toast } from 'svelte-sonner';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm } from 'sveltekit-superforms/client';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { updateNameSchema } from '$lib/schema/updateName';

  import { Save, RefreshCw } from '@lucide/svelte';

  const {
    sourceForm,
    user
  }: { sourceForm: SuperValidated<Infer<typeof updateNameSchema>>; user: any } = $props();

  const { form, message, errors, enhance } = superForm(sourceForm, {
    validators: zod4Client(updateNameSchema),
    customValidity: false,
    validationMethod: 'auto',

    onSubmit: ({ cancel }) => {
      if ($form.name === user?.name) {
        toast.error('Please enter a new name.');
        cancel();
      }
    },

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to update name. Try again later.');
    }
  });

  $form.name = user?.name || '';

  $effect(() => {
    if ($message === 'Updated') {
      window.location.reload();
    }
  });
</script>

<form action="?/updateName" method="POST" use:enhance>
  <div class="flex items-center gap-2">
    <input
      type="text"
      name="name"
      class="w-full max-w-lg rounded-lg border p-2"
      placeholder={'Enter a name...'}
      bind:value={$form.name}
    />
    {#if $form.name !== user?.name && $form.name !== ''}
      <button
        class="h-10.5 w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600"
        aria-label="Save Name"
        type="submit"
      >
        <Save size="20" />
      </button>
      <button
        class="flex h-10.5 w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        onclick={() => {
          $form.name = user?.name || '';
        }}
      >
        <RefreshCw size="20" />
        Reset
      </button>
    {/if}
  </div>

  {#if $errors.name}
    {#each $errors.name as error}
      <p class="mt-2 text-sm text-red-500">{error}</p>
    {/each}
  {/if}
  {#if $errors._errors}
    {#each $errors._errors as error}
      <p class="mt-2 text-sm text-red-500">{error}</p>
    {/each}
  {/if}
</form>
