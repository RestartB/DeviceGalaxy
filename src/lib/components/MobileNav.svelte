<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  import { House, Laptop, List, Share2, Settings } from '@lucide/svelte';

  import type { Path } from '$app/types';
  import type { Component } from 'svelte';
</script>

{#snippet link(Icon: Component, href: Path, pageActive: boolean = false)}
  <a
    href={resolve(href)}
    class="flex items-center justify-center p-4 opacity-60 transition-opacity"
    class:opacity-100={pageActive}
  >
    <Icon size={32} />
  </a>
{/snippet}

<nav
  class="pointer-events-auto flex items-center justify-center gap-2 rounded-full border-2 border-zinc-300 bg-zinc-200/70 px-2 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-800/70"
  style="view-transition-name: mobile-bar"
>
  {@render link(House, '', page.url.pathname === '/')}
  {@render link(
    Laptop,
    'dash/devices',
    page.url.pathname === '/dash/devices' || page.url.pathname.startsWith('/dash/devices/')
  )}
  {@render link(List, 'dash/specs', page.url.pathname === '/dash/specs')}
  {@render link(Share2, '')}
  {@render link(Settings, '')}
</nav>
