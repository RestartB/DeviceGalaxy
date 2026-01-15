<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { deleteAccountSchema } from '$lib/schema/deleteAccount';

  import { X, Trash } from '@lucide/svelte';

  // Get session from props
  const { data } = $props();

  const { form, errors, enhance } = superForm(data.deleteAccountForm, {
    validators: zod4Client(deleteAccountSchema),
    customValidity: false,
    validationMethod: 'auto',

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to delete account. Try again later.');
    }
  });

  let deletePopupOpen = $state(false);
</script>

{#if deletePopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (deletePopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Delete Account</h2>
        <button
          onclick={() => (deletePopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <form method="POST" class="flex flex-col" action="?/deleteAccount" use:enhance>
        <div class="flex flex-col gap-4 p-6">
          <p>
            When you delete your account, all data about you will be permanently removed from our
            systems. <strong>This action is irreversible and cannot be undone.</strong> Data will be permanently
            removed. If you're ready to do this, confirm your password, then click the delete account
            button below.
          </p>
          <label for="email" class="text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            id="password"
            name="password"
            class="w-full rounded-lg border p-2"
            bind:value={$form.password}
          />
          {#if $errors.password}
            {#each $errors.password as error}
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
            class="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-500"
            disabled={$form.password === ''}>Delete Account</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<div class="flex flex-col gap-4">
  <h3 class="text-2xl font-bold">Delete Account</h3>
  <p>
    When you delete your account, all data about you will be permanently removed from our systems. <strong
      >This action is irreversible and cannot be undone.</strong
    > Data will be permanently removed. If you're ready to do this, click the button below. You will be
    required to enter your password to confirm before your account is deleted.
  </p>

  <button
    class="flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-red-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-red-700 dark:text-zinc-200 dark:hover:bg-red-600"
    onclick={() => (deletePopupOpen = true)}
  >
    <Trash size="20" />
    Delete Account
  </button>
</div>
