<script lang="ts">
  const { data } = $props();

  // eslint-disable-next-line no-useless-assignment
  let greeting = $state('');

  // decide greeting based on browser time
  const time = new Date().getHours();
  if (time > 5 && time < 12) {
    greeting = 'Good morning, ';
  } else if (time >= 12 && time < 19) {
    greeting = 'Good afternoon, ';
  } else {
    greeting = 'Good evening, ';
  }
</script>

{#snippet statsSquare(title: string, amount: number)}
  <div
    class="text-start rounded-lg p-2 px-4 border-2 border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
  >
    <p class="font-semibold">{title}</p>
    <p class="font-mono text-3xl">{amount}</p>
  </div>
{/snippet}

{#if data.user}
  <div class="space-y-4">
    <h1 class="text-4xl">
      {greeting || 'Hi there, '}
      <span
        class="bg-linear-to-r from-purple-900 to-purple-700 dark:from-purple-100 dark:to-purple-400 bg-clip-text font-bold text-transparent"
        translate="no"
      >
        {data.user.name}
      </span>
    </h1>

    <h3 class="text-xl font-semibold">Stats</h3>
    <div class="flex gap-4 items-center flex-wrap">
      {@render statsSquare('Devices', 100)}
      {@render statsSquare('Tags', 50)}
      {@render statsSquare('Shares', 30)}
      {@render statsSquare('Share Views', 20864)}
    </div>

    <h3 class="text-xl font-semibold">Recently added</h3>

    <h3 class="text-xl font-semibold">Recently modified</h3>

    <h3 class="text-xl font-semibold">Recently shared</h3>
  </div>
{/if}
