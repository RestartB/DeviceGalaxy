<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { authClient } from '$lib/client';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm, fileProxy } from 'sveltekit-superforms/client';
  import type { SuperValidated, Infer } from 'sveltekit-superforms';
  import { profilePictureSchema } from '$lib/schema/profilePicture.js';

  import { Save } from '@lucide/svelte';

  const {
    sourceForm,
    user
  }: { sourceForm: SuperValidated<Infer<typeof profilePictureSchema>>; user: any } = $props();

  const { form, message, errors, enhance } = superForm(sourceForm, {
    validators: zod4Client(profilePictureSchema),
    customValidity: false,
    validationMethod: 'auto',

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to submit profile picture. Try again later.');
    }
  });

  $effect(() => {
    if ($message === 'Updated') {
      window.location.reload();
    }
  });

  const file = fileProxy(form, 'image');

  async function resetAvatar() {
    try {
      if (!user || !user.image) {
        return;
      }

      const response = await fetch(user.image, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset avatar');
      }

      await authClient.updateUser({ image: null });
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reset avatar. Please try again.');
      console.error('Error resetting avatar:', error);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <form
    enctype="multipart/form-data"
    action="?/uploadPFP"
    method="POST"
    class="flex flex-col gap-2"
    use:enhance
  >
    <div class="flex gap-2">
      {#if $file?.length > 0}
        <button
          type="submit"
          class="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600"
        >
          <Save size="20" />
        </button>
      {/if}

      <input
        class="w-full file:w-fit file:cursor-pointer file:rounded-lg file:border-2 file:border-zinc-400 file:bg-zinc-200 file:p-2 file:font-semibold file:text-zinc-700 file:transition-colors file:hover:bg-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:file:hover:bg-zinc-600"
        name="image"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        bind:files={$file}
      />
    </div>
    {#if $errors.image}
      {#each $errors.image as error}
        <p class="text-sm text-red-500">{error}</p>
      {/each}
    {/if}
    {#if $errors._errors}
      {#each $errors._errors as error}
        <p class="text-sm text-red-500">{error}</p>
      {/each}
    {/if}
  </form>
  {#if user?.image && !$errors.image && !$errors._errors}
    <button
      class="w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-red-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-red-700 dark:text-zinc-200 dark:hover:bg-red-600"
      onclick={resetAvatar}
    >
      Reset Avatar
    </button>
  {/if}
</div>
