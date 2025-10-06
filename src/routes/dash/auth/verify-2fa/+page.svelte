<script lang="ts">
  import { goto } from '$app/navigation';
  import { authClient } from '$lib/client';

  let totpInput = $state('');

  let submitting = $state(false);
  let error = $state('');

  async function handleSubmit(event: Event) {
    event.preventDefault();
    submitting = true;
    error = '';

    try {
      const { data, error: signInError } = await authClient.twoFactor.verifyTotp({
        code: totpInput
      });

      if (signInError) {
        error = signInError.message || 'Failed to verify 2FA code.';
        return;
      }

      await goto('/dash');
    } catch (err) {
      error = 'An unexpected error occurred. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>DeviceGalaxy - Verify 2FA</title>
</svelte:head>

<div class="absolute inset-0 m-4 mt-16 flex items-center justify-center text-center">
  <div
    class="fixed top-0 left-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
    style="background-image: url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920')"
  ></div>
  <form
    class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-4 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
    onsubmit={handleSubmit}
  >
    <h1 class="text-2xl font-bold">Two Factor Authentication</h1>
    <p>Please enter a 2FA code from your authenticator app.</p>
    <div class="flex flex-col gap-2">
      <label for="totp" class="font-semibold">Code</label>
      <input
        class="rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 dark:bg-zinc-700"
        id="totp"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="6"
        bind:value={totpInput}
      />
    </div>

    <button
      disabled={submitting}
      class="w-fit rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
    >
      {submitting ? 'Verifying...' : 'Verify'}
    </button>
    {#if error !== ''}
      <div class="text-red-700">
        {error}
      </div>
    {/if}
  </form>
</div>
