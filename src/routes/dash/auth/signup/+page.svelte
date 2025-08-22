<script lang="ts">
  import { PUBLIC_TURNSTILE_SITE_KEY, PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';
  import { Turnstile } from 'svelte-turnstile';

  import { goto } from '$app/navigation';

  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { newUserSchema } from '$lib/schema/newUser';

  import { UserPlus } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  const { data } = $props();
  let reset = $state<() => void>();

  const { form, errors, allErrors, submitting, message, enhance } = superForm(data.newUserForm, {
    validators: zod4Client(newUserSchema),
    customValidity: false,
    validationMethod: 'auto',

    onError: (error) => {
      console.error('Form submission error:', error);
      toast.error('Failed to create an account. Try again later.');
    },

    onUpdated() {
      // When the form is updated, we reset the turnstile
      reset?.();
    }
  });

  $effect(() => {
    if ($message === 'User created successfully') {
      toast.success('Account created successfully! Redirecting to setup...');
      setTimeout(() => {
        goto('/dash/auth/setup-2fa');
      }, 2000);
    } else if ($message) {
      toast.error($message);
    }
  });
</script>

<svelte:head>
  <title>DeviceGalaxy - Sign Up</title>
</svelte:head>

<div class="box-border flex h-full min-h-fit w-full items-center justify-center text-center">
  <div
    class="absolute top-0 left-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat after:pointer-events-none after:absolute after:top-0 after:left-0 after:h-full after:w-full after:backdrop-blur-lg after:backdrop-brightness-120 after:content-['']"
    style="background-image: url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jeremy-thomas-4dpAqfTbvKA-unsplash.jpg&w=1920')"
  ></div>
  <form
    class="flex h-fit w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-700 bg-zinc-100 p-4 backdrop-blur-lg dark:bg-zinc-800/80"
    action="?/createAccount"
    method="POST"
    use:enhance
  >
    <h1 class="flex items-center justify-center gap-2 text-2xl font-bold">
      <UserPlus /> Create Account
    </h1>
    <p><strong>Welcome!</strong> Please fill in the details to create your account.</p>

    <div class="flex w-full flex-col gap-2">
      <label for="name" class="w-full text-start font-semibold">Name</label>
      <input
        class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
        name="name"
        id="name"
        type="text"
        bind:value={$form.name}
      />
      {#if $errors.name}<span class="text-red-600">{$errors.name}</span>{/if}
    </div>

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

    <div class="flex w-full flex-col gap-2">
      <label for="password" class="w-full text-start font-semibold">Password</label>
      <input
        class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
        name="password"
        id="password"
        type="password"
        bind:value={$form.password}
      />
      {#if $errors.password}<span class="text-red-600">{$errors.password}</span>{/if}
    </div>

    <div class="flex w-full flex-col gap-2">
      <label for="confirm" class="w-full text-start font-semibold">Confirm Password</label>
      <input
        class="w-full rounded-full border-2 border-zinc-500 bg-zinc-200 p-2 px-4 text-start dark:bg-zinc-700"
        name="confirm"
        id="confirm"
        type="password"
        bind:value={$form.confirm}
      />
      {#if $errors.confirm}<span class="text-red-600">{$errors.confirm}</span>{/if}
    </div>

    {#if PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'}
      <Turnstile
        siteKey={PUBLIC_TURNSTILE_SITE_KEY}
        theme="auto"
        bind:reset
        on:callback={(event) => {
          const { token } = event.detail;
          $form['cf-turnstile-response'] = token;
        }}
      />
      {#if $errors['cf-turnstile-response']}<span class="text-red-600"
          >{$errors['cf-turnstile-response']}</span
        >{/if}
    {/if}

    <a href="/dash/auth/login" class="text-blue-600 hover:underline dark:text-blue-400">
      Already have an account? Log in
    </a>

    <p>
      By signing up, you agree to our <a
        href="/policy/tos"
        class="text-blue-600 hover:underline dark:text-blue-400">Terms of Service</a
      >
      and
      <a href="/policy/privacy" class="text-blue-600 hover:underline dark:text-blue-400"
        >Privacy Policy</a
      >.
    </p>

    <button
      type="submit"
      class="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-200 p-2 px-4 font-bold transition-all hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:dark:hover:bg-zinc-700"
      disabled={$allErrors.length > 0 || $submitting}
    >
      <UserPlus />
      Sign Up
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
