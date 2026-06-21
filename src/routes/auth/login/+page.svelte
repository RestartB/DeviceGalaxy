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

<form class="flex gap-2 flex-col" {...logIn}>
  <h1 class="text-4xl font-bold">Log in</h1>
  <p>Welcome back! Please enter your username and password to log in.</p>

  <label class="text-base -mb-1 mt-2" for="email">Email Address</label>
  <Text id="email" {...email.as('email')} />

  {#each email.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="text-base -mb-1" for="password">Password</label>
  <Text id="password" {...password.as('password')} />

  {#each password.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <p class="text-base">Captcha</p>
  <div id="turnstile-container" class="h-fit -mb-2"></div>

  {#each turnstileToken.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <a
    class="my-2 text-blue-600 dark:text-blue-400 dark:hover:text-blue-200 hover:text-blue-800 cursor-pointer w-fit"
    href={resolve('/auth/signup')}
  >
    Don't have an account? Sign up
  </a>

  <Button class="flex gap-1 items-center justify-center" smallPadding={true} type="submit">
    <LogIn size={18} /> Log in
  </Button>
</form>
