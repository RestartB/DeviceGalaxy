<script lang="ts">
  import { resolve } from '$app/paths';
  import { afterNavigate } from '$app/navigation';

  import { LogIn } from '@lucide/svelte';
  import logo from '$lib/assets/logo.svg';

  import type { Pathname } from '$app/types';
  import type { User } from 'better-auth';

  const { user }: { user?: User | undefined } = $props();

  let menuOpen = $state(false);
  let width = $state(0);

  afterNavigate(() => {
    menuOpen = false;
  });

  $effect(() => {
    if (menuOpen && width >= 568) {
      menuOpen = false;
    }
  });
</script>

<svelte:window bind:innerWidth={width} />

{#snippet topRowLink(title: string, href: Pathname)}
  <a
    href={resolve(href)}
    class="hidden h-full items-center border-y-transparent border-b-zinc-400 px-2 transition-all hover:border-y-4 xs:flex dark:border-b-zinc-500"
  >
    {title}
  </a>
{/snippet}

<header
  class="fixed z-100 h-12 w-full border-b-2 border-b-zinc-300 bg-zinc-200 text-base dark:border-b-zinc-700 dark:bg-zinc-800"
  style="view-transition-name: header"
>
  <div class="mx-auto flex h-full max-w-7xl items-center">
    <div class="mr-auto ml-4 flex h-full shrink-0 items-center">
      <div class="mr-2 flex items-center gap-2">
        <img src={logo} alt="Titanium" class="h-8 w-8 rounded-md" translate="no" />
        <h1 class="text-lg font-bold" translate="no">DeviceGalaxy</h1>
      </div>

      <nav class="flex h-full shrink-0 items-center">
        {#if user}
          {@render topRowLink('Home', '/')}
          {@render topRowLink('Devices', '/')}
          {@render topRowLink('Tags', '/')}
          {@render topRowLink('Specs', '/')}
          {@render topRowLink('Shares', '/')}
        {/if}
      </nav>
    </div>

    <a
      class="mr-4 ml-2 hidden items-center justify-center gap-1 rounded-lg border border-zinc-400 bg-zinc-300 p-1 px-2 transition-colors hover:bg-zinc-200 xs:flex dark:border-zinc-600 dark:bg-zinc-700 hover:dark:bg-zinc-800"
      href={resolve('/auth/login')}
    >
      <LogIn size={20} />
      Log In
    </a>
  </div>
</header>
