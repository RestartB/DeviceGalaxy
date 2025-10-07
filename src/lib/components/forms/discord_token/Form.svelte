<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toast } from 'svelte-sonner';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm } from 'sveltekit-superforms/client';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { discordVerificationSchema } from '$lib/schema/discordVerification';

  import { Key, X } from '@lucide/svelte';

  const {
    sourceForm,
    user
  }: { sourceForm: SuperValidated<Infer<typeof discordVerificationSchema>>; user: any } = $props();

  const { form, message, errors, allErrors, enhance } = superForm(sourceForm, {
    validators: zod4Client(discordVerificationSchema),
    customValidity: false,
    invalidateAll: false,
    validationMethod: 'auto',
    id: 'discord-token',

    onSubmit: ({ cancel }) => {
      if ($form.token === user?.discordDomainVerifyToken) {
        toast.error('Please enter a new token.');
        cancel();
      }
    },

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to save token. Try again later.');
    }
  });

  $form.token = user?.discordDomainVerifyToken || '';

  $effect(() => {
    if ($message === 'Updated') {
      window.location.reload();
    }
  });

  let tokenPopupOpen = $state(false);
</script>

{#if tokenPopupOpen}
  <div
    class="fixed inset-0 z-60 mt-12 flex items-center justify-center overflow-hidden bg-white/60 p-4 backdrop-blur-lg dark:bg-black/60"
    transition:fade={{ duration: 100 }}
  >
    <div
      class="absolute inset-0 z-70"
      onclick={() => (tokenPopupOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="z-80 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border-4 border-zinc-400 bg-zinc-100 shadow-2xl dark:bg-zinc-800"
    >
      <div class="flex items-center justify-between border-b p-4">
        <h2 class="text-xl font-bold">Enter Discord Content</h2>
        <button
          onclick={() => (tokenPopupOpen = false)}
          class="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          aria-label="Close"><X /></button
        >
      </div>
      <form action="?/tokenUpdate" method="POST" use:enhance>
        <div class="flex flex-col gap-4 p-6">
          <p>
            Copy the text from the content box in Discord, and paste it into the token box below.
            The token will be saved immediately when you press save. Once you've saved the token,
            click "Verify" in Discord to add your subdomain to your Discord profile.
          </p>

          <enhanced:img
            src="$lib/images/token.png"
            alt="Discord Token Example"
            class="rounded-lg border"
          />

          <label for="token" class="text-sm font-medium">Discord Token</label>
          <input
            id="token"
            name="token"
            type="text"
            class="w-full rounded-lg border p-2"
            placeholder={'Enter token...'}
            bind:value={$form.token}
          />

          {#if $errors.token}
            {#each $errors.token as error}
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
            disabled={$form.token === user?.discordDomainVerifyToken || $allErrors.length > 0}
            >Save Token</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<button
  class="flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
  onclick={() => (tokenPopupOpen = true)}
>
  <Key size="20" />
  Enter Discord Content
</button>
