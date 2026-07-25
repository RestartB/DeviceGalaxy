<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { resolve } from '$app/paths';

  import { logIn } from '$lib/remote/auth.remote';

  import Button from '$lib/components/ui/inputs/Button.svelte';
  import Text from '$lib/components/ui/inputs/Text.svelte';
  import FullscreenOverlay from '$lib/components/ui/FullscreenOverlay.svelte';
  import { LogIn } from '@lucide/svelte';

  import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

  const { email, password, turnstileToken } = logIn.fields;

  let widgetId: string | null | undefined;
  let errorOverlayOpen = $state(false);

  onMount(() => {
    widgetId = turnstile.render('#turnstile-container', {
      sitekey: PUBLIC_TURNSTILE_SITE_KEY,
      'response-field-name': 'turnstileToken'
    });
  });

  onDestroy(() => {
    if (widgetId) {
      turnstile.remove(widgetId);
    }
  });

  $effect(() => {
    if (logIn.result && !logIn.result.success) {
      if (widgetId) {
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

  {#each email.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="-mb-1 text-base" for="password">Password</label>
  <Text id="password" {...password.as('password')} />

  {#each password.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <p class="text-base">Captcha</p>
  <div id="turnstile-container" class="-mb-2 h-fit"></div>

  {#each turnstileToken.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <a
    class="my-2 w-fit cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
    href={resolve('/auth/signup')}
  >
    Don't have an account? Sign up
  </a>

  <Button class="flex items-center justify-center gap-1" smallPadding={true} type="submit">
    <LogIn size={18} /> Log in
  </Button>
</form>
