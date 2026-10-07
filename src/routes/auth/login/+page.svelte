<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { resolve } from '$app/paths';

  import { logIn } from '#lib/remote/auth.remote.js';

  import Button from '#lib/components/ui/inputs/Button.svelte';
  import Text from '#lib/components/ui/inputs/Text.svelte';
  import FullscreenOverlay from '#lib/components/ui/FullscreenOverlay.svelte';
  import { LogIn } from '@lucide/svelte';

  import { TURNSTILE_ENABLED, TURNSTILE_SITE_KEY } from '$app/env/public';
  import { goto } from '$app/navigation';

  const { email, password, turnstileToken } = logIn.fields;

  let widgetId: string | null | undefined;
  let errorOverlayOpen = $state(false);

  onMount(() => {
    if (!TURNSTILE_ENABLED) {
      return;
    }

    widgetId = turnstile.render('#turnstile-container', {
      sitekey: TURNSTILE_SITE_KEY,
      'response-field-name': 'turnstileToken'
    });
  });

  onDestroy(() => {
    if (TURNSTILE_ENABLED && widgetId) {
      turnstile.remove(widgetId);
    }
  });

  $effect(() => {
    if (!logIn.result) {
      return;
    }

    if (logIn.result.success) {
      console.log('success');
      void goto(resolve(''));
    } else {
      if (TURNSTILE_ENABLED && widgetId) {
        turnstile.reset(widgetId);
      }
      errorOverlayOpen = true;
    }
  });
</script>

{#if errorOverlayOpen}
  <FullscreenOverlay
    title="Unknown Error"
    padding={16}
    height={250}
    bind:overlayOpen={errorOverlayOpen}
  >
    <p>An error occurred. Please try again later.</p>
  </FullscreenOverlay>
{/if}

<form class="flex flex-col gap-2" {...logIn}>
  <h1 class="text-4xl font-bold">Log in</h1>
  <p>Welcome back! Please enter your username and password to log in.</p>

  <label class="mt-2 -mb-1 text-base" for="email">Email Address</label>
  <Text id="email" {...email.as('email')} />

  {#each email.issues() as issue (issue.message)}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="-mb-1 text-base" for="password">Password</label>
  <Text id="password" {...password.as('password')} />

  {#each password.issues() as issue (issue.message)}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  {#if TURNSTILE_ENABLED}
    <label class="text-base" for="turnstile-container">Captcha</label>
    <div id="turnstile-container" class="mr-auto -mb-2 h-fit"></div>

    {#each turnstileToken.issues() as issue (issue.message)}
      <p class="text-red-600">{issue.message}</p>
    {/each}
  {/if}

  <a
    class="my-2 w-fit cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
    href={resolve('auth/signup')}>Don't have an account? Sign up</a
  >

  <Button smallPadding={true} type="submit">
    <LogIn size={18} /> Log in
  </Button>
</form>
