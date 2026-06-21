<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { resolve } from '$app/paths';

  import { signUp } from '$lib/remote/auth.remote';

  import Button from '$lib/components/ui/inputs/Button.svelte';
  import Text from '$lib/components/ui/inputs/Text.svelte';
  import { UserPlus } from '@lucide/svelte';

  import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

  const { name, email, password, passwordConfirm, turnstileToken } = signUp.fields;

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
    if (signUp.result && !signUp.result.success) {
      if (widgetId) {
        turnstile.reset(widgetId);
      }
      errorOverlayOpen = true;
    }
  });
</script>

<h1 class="text-4xl font-bold">Sign up</h1>
<p>Welcome! Enter your name, email address and a password to get started.</p>

<form class="flex gap-2 flex-col" {...signUp}>
  <label class="text-base -mb-1 mt-2" for="name">Name</label>
  <Text id="name" {...name.as('text')} />

  {#each name.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="text-base -mb-1" for="email">Email Address</label>
  <Text id="email" {...email.as('email')} />

  {#each email.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="text-base -mb-1" for="password">Password</label>
  <Text id="password" {...password.as('password')} />

  {#each password.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <label class="text-base -mb-1" for="confirm-password">Confirm Password</label>
  <Text id="confirm-password" {...passwordConfirm.as('password')} />

  {#each passwordConfirm.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <p class="text-base">Captcha</p>
  <div id="turnstile-container" class="h-fit -mb-2"></div>

  {#each turnstileToken.issues() as issue}
    <p class="text-red-600">{issue.message}</p>
  {/each}

  <a
    class="my-2 text-blue-600 dark:text-blue-400 dark:hover:text-blue-200 hover:text-blue-800 cursor-pointer w-fit"
    href={resolve('/auth/login')}
  >
    Have an account already? Log in
  </a>

  <Button class="flex gap-1 items-center justify-center" smallPadding={true} type="submit">
    <UserPlus size={18} /> Sign up
  </Button>
</form>
