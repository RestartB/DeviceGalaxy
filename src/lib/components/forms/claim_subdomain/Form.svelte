<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm } from 'sveltekit-superforms/client';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { subdomainSchema } from '$lib/schema/subdomain';

  import { BadgeCheck, X } from '@lucide/svelte';

  const {
    sourceForm,
    user
  }: { sourceForm: SuperValidated<Infer<typeof subdomainSchema>>; user: any } = $props();

  const { form, message, errors, allErrors, enhance } = superForm(sourceForm, {
    validators: zod4Client(subdomainSchema),
    customValidity: false,
    invalidateAll: false,
    validationMethod: 'auto',
    id: 'claim-subdomain',

    onSubmit: ({ cancel }) => {
      if ($form.subdomain === user?.subdomain) {
        toast.error('Please enter a new subdomain.');
        cancel();
      }
    },

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to claim subdomain. Try again later.');
    }
  });

  $form.subdomain = user?.subdomain || '';

  $effect(() => {
    if ($message === 'Updated') {
      window.location.reload();
    }
  });

  let subdomainPopupOpen = $state(false);
</script>

{#if subdomainPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (subdomainPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Claim Subdomain</h2>
        <button
          onclick={() => (subdomainPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <form action="?/claimSubdomain" method="POST" use:enhance>
        <div class="flex flex-col gap-4 p-6">
          {#if user?.subdomain}
            <p>
              When you claim a new subdomain, your old one will no longer work, and may be claimed
              by other users.
            </p>
          {/if}

          <label for="subdomain" class="text-sm font-medium">New Subdomain</label>
          <input
            id="subdomain"
            name="subdomain"
            type="text"
            class="w-full rounded-lg border p-2"
            placeholder={'Enter a subdomain...'}
            bind:value={$form.subdomain}
          />

          {#if $errors.subdomain}
            {#each $errors.subdomain as error}
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
            disabled={$form.subdomain === user?.subdomain || $allErrors.length > 0}
            >Claim Subdomain</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<button
  class="flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
  onclick={() => (subdomainPopupOpen = true)}
>
  <BadgeCheck size="20" />
  Claim Subdomain
</button>
