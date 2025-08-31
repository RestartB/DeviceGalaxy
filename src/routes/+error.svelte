<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="border-box flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
  <div>
    <h1 class="font-mono text-8xl font-bold">{page.status}</h1>
    <h2 class="text-4xl">
      {page.error && page.error.message ? page.error.message : 'An error occurred'}
    </h2>
  </div>
  <a
    href="/"
    class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
  >
    Go Home
  </a>
</div>
