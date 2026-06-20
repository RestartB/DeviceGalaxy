<script>
  import { resolve } from '$app/paths';
</script>

<footer
  class="border-t-2 border-t-zinc-300 bg-zinc-200 text-base text-zinc-500 dark:border-t-zinc-700 dark:bg-zinc-800"
  style="view-transition-name: footer"
>
  <nav class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 p-2 px-4">
    <p class="font-bold">
      © 2026, <a
        href="https://restartb.xyz"
        class="font-normal transition-all hover:font-bold hover:text-zinc-700 hover:dark:text-zinc-300"
      >
        Restart
      </a>
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <a
        href={resolve('/server')}
        class="transition-all hover:font-bold hover:text-zinc-700 hover:dark:text-zinc-300"
      >
        Support Server
      </a>
      <a
        href="#"
        class="transition-all hover:font-bold hover:text-zinc-700 hover:dark:text-zinc-300"
      >
        Terms of Use
      </a>
      <a
        href="#"
        class="transition-all hover:font-bold hover:text-zinc-700 hover:dark:text-zinc-300"
      >
        Privacy Policy
      </a>
    </div>
  </nav>
</footer>
