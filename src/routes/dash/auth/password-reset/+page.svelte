<script lang="ts">
  import { Turnstile } from 'svelte-turnstile';

  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { enterEmailSchema } from '$lib/schema/resetPassword';

  import { RefreshCw, Send } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  import { env } from '$env/dynamic/public';

  const { data } = $props();
  let reset = $state<() => void>();

  const { form, errors, allErrors, submitting, enhance } = superForm(data.enterEmailForm, {
    validators: zod4Client(enterEmailSchema),
    validationMethod: 'auto',

    onError: ({ result }) => {
      console.error('Form submission error:', result);
      if (result.error?.message) {
        toast.error('Failed to send reset email: ' + result.error.message);
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    },

    onUpdated({ form }) {
      if (form.message) {
        toast.success(form.message);
      }

      // When the form is updated, we reset the turnstile
      reset?.();
    }
  });
</script>

<svelte:head>
  <title>DeviceGalaxy - Reset Password</title>
</svelte:head>

<div class="absolute inset-0 m-4 mt-16 flex items-center justify-center text-center">
  <div
    class="fixed top-0 left-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
    style="background-image: url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920')"
  ></div>
  <form
    class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-4 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
    action="?/sendEmail"
    method="POST"
    use:enhance
  >
    <h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
      <RefreshCw /> Reset Password
    </h1>
    <p>
      <strong>Forgot your password?</strong> Please enter your email to reset it. If an account with
      the entered email exists, a password reset email will be sent.
      <strong>Please note that the link will expire after 1 hour.</strong>
    </p>
    <div class="flex w-full flex-col gap-2">
      <label for="email" class="w-full text-start font-semibold">Email</label>
      <input
        class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
        name="email"
        id="email"
        type="email"
        bind:value={$form.email}
      />
      {#if $errors.email}<span class="text-red-600">{$errors.email}</span>{/if}
    </div>

    {#if env.PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'}
      <Turnstile
        siteKey={env.PUBLIC_TURNSTILE_SITE_KEY}
        bind:reset
        on:callback={(event) => {
          // Required when using client side validation
          $form['cf-turnstile-response'] = event.detail.token;
        }}
      />
    {/if}

    {#if $errors['cf-turnstile-response']}<span class="text-red-600"
        >{$errors['cf-turnstile-response']}</span
      >{/if}

    <a href="/dash/auth/login" class="text-blue-600 hover:underline dark:text-blue-400">
      Remembered your password? Log in
    </a>

    <button
      type="submit"
      class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-all hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:dark:hover:bg-zinc-700"
      disabled={$allErrors.length > 0 || $submitting}
    >
      <Send />
      Send Reset Link
    </button>

    {#if $errors._errors && $errors._errors.length > 0}
      {#each $errors._errors as error}
        <div class="text-red-700">
          {error}
        </div>
      {/each}
    {/if}
  </form>
</div>
