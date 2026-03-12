<script lang="ts">
  import { page } from '$app/state';
  import { toast } from 'svelte-sonner';
  import { authClient } from '$lib/client';

  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { superForm, fileProxy } from 'sveltekit-superforms/client';
  import { backgroundSchema } from '$lib/schema/background';

  import { Save } from '@lucide/svelte';

  import type { SuperValidated, Infer } from 'sveltekit-superforms';

  const {
    sourceForm,
    user
  }: {
    sourceForm: SuperValidated<Infer<typeof backgroundSchema>>;
    user: typeof authClient.$Infer.Session.user;
  } = $props();

  const { form, message, errors, allErrors, enhance } = superForm(sourceForm, {
    validators: zod4Client(backgroundSchema),
    customValidity: false,
    validationMethod: 'auto',

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to submit background. Try again later.');
    }
  });

  $form.blurPx = user.backgroundImageBlurPx || 0;

  $effect(() => {
    if ($message === 'Updated') {
      console.log('reloading via form');
      window.location.reload();
    }
  });

  const file = fileProxy(form, 'image');

  async function resetBg() {
    try {
      if (!user || !user.backgroundImage) {
        return;
      }

      const response = await fetch(`${page.url.origin}/api/image/bg/${user.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset background');
      }

      window.location.reload();
    } catch (error) {
      toast.error('Failed to reset background. Please try again.');
      console.error('Error resetting background:', error);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div
    class="flex h-60 w-120 items-center justify-center overflow-hidden rounded-xl border-2 border-zinc-400 bg-zinc-100 dark:bg-zinc-800"
  >
    {#if $form.image}
      <img
        src={URL.createObjectURL($form.image)}
        class="h-fit w-fit"
        alt="Background preview"
        style="filter: blur({($form.blurPx || 0) * 0.5}px)"
      />
    {:else if user.backgroundImage}
      <img
        src={user.backgroundImage}
        class="h-fit w-fit"
        alt="Background preview"
        style="filter: blur({($form.blurPx || 0) * 0.5}px)"
      />
    {:else}
      No background set.
    {/if}
  </div>

  <form
    enctype="multipart/form-data"
    action="?/uploadBg"
    method="POST"
    class="flex flex-col gap-2"
    use:enhance
  >
    <div class="flex gap-2">
      <input
        class="w-full file:w-fit file:cursor-pointer file:rounded-lg file:border-2 file:border-zinc-400 file:bg-zinc-200 file:p-2 file:font-semibold file:text-zinc-700 file:transition-colors file:hover:bg-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:file:hover:bg-zinc-600"
        name="image"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        bind:files={$file}
      />
    </div>

    {#if $errors.image}
      {#each $errors.image as error (error)}
        <p class="text-sm text-red-500">{error}</p>
      {/each}
    {/if}

    {#if user.backgroundImage}
      <button
        class="w-fit cursor-pointer overflow-hidden rounded-lg border-2 border-zinc-400 bg-red-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-red-300 dark:bg-red-700 dark:text-zinc-200 dark:hover:bg-red-600"
        onclick={resetBg}
        type="button"
      >
        Reset Background
      </button>
    {/if}

    {#if $file?.length > 0 || user.backgroundImage}
      <h4 class="mt-2 text-xl font-bold">Background Blur</h4>
      <h5 class="font-semibold">
        Set a background blur in px. Higher px values may cause lag on weaker devices.
      </h5>

      <input
        type="number"
        name="blurPx"
        class="w-full max-w-lg rounded-lg border p-2"
        placeholder="100"
        bind:value={$form.blurPx}
      />

      {#if $errors.blurPx}
        {#each $errors.blurPx as error (error)}
          <p class="text-sm text-red-500">{error}</p>
        {/each}
      {/if}
    {/if}

    {#if $file?.length > 0 || $form.blurPx !== user.backgroundImageBlurPx}
      <button
        type="submit"
        class="mt-2 flex w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-zinc-400 bg-green-200 p-2 font-semibold text-zinc-700 transition-colors hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-green-600"
        disabled={$allErrors.length > 0}
      >
        <Save size="20" />
        Save
      </button>
    {/if}

    {#if $errors._errors}
      {#each $errors._errors as error (error)}
        <p class="text-sm text-red-500">{error}</p>
      {/each}
    {/if}
  </form>
</div>
