<script lang="ts">
  import { page } from '$app/state';
  import { authClient } from '$lib/client';

  import { LogIn, TriangleAlert, CircleQuestionMark, RefreshCw } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  let token = page.url.searchParams.get('token') || '';
  let error = page.url.searchParams.get('error') || '';

  let newPassword = $state('');

  async function resetPassword() {
    const { error } = await authClient.resetPassword({
      newPassword: newPassword,
      token
    });

    if (error) {
      toast.error(
        'Failed to reset password: ' +
          (error.message ? error.message?.toLocaleLowerCase() : 'unknown error. Please try again.')
      );
      return;
    }

    location.href = '/dash/auth/login';
  }
</script>

<svelte:head>
  <title>DeviceGalaxy - Reset Password</title>
</svelte:head>

<div class="absolute inset-0 m-4 mt-16 flex items-center justify-center text-center">
  <div
    class="fixed top-0 left-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
    style="background-image: url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920')"
  ></div>
  <div
    class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-4 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
  >
    {#if error}
      <h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
        <TriangleAlert /> Error
      </h1>
      {#if error === 'INVALID_TOKEN'}
        <p>The reset token is invalid or has expired. Please request a new password reset.</p>
      {:else}
        <p>An unknown error has occurred. Please try again later.</p>
      {/if}

      <a
        href="/dash/auth/login"
        class="flex w-fit items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-all hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        <LogIn />
        Back to Login Page
      </a>
    {:else if !token}
      <h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
        <CircleQuestionMark /> No Token
      </h1>
      <p>No reset token provided. Please try again with the link from your email.</p>

      <a
        href="/dash/auth/login"
        class="flex w-fit items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-all hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        <LogIn />
        Back to Login Page
      </a>
    {:else}
      <h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
        <RefreshCw /> Reset Password
      </h1>

      <p>Please enter a new password below.</p>
      <div class="flex w-full flex-col gap-2">
        <label for="password" class="w-full text-start font-semibold">New Password</label>
        <input
          class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
          name="password"
          id="password"
          type="password"
          bind:value={newPassword}
        />
      </div>

      {#if newPassword.length > 0 && newPassword.length < 8}
        <span class="text-red-600">Password must be at least 8 characters long.</span>
      {/if}

      <a href="/dash/auth/login" class="text-blue-600 hover:underline dark:text-blue-400">
        Remembered your password? Log in
      </a>

      <button
        type="submit"
        class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-all hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:dark:hover:bg-zinc-700"
        onclick={resetPassword}
        disabled={newPassword.length < 8}
      >
        <RefreshCw />
        Reset Password
      </button>
    {/if}
  </div>
</div>
