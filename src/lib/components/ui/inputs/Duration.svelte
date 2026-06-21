<script lang="ts">
  import { onMount } from 'svelte';
  let {
    seconds = $bindable(),
    border = true,
    class: className = '',
    aria = ''
  }: { seconds?: number | null; border?: boolean; class?: string; aria?: string } = $props();
  let stringValue = $state('');

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    mon: 2592000,
    y: 31536000
  };

  // calculate date string based on initial seconds value
  onMount(() => {
    if (seconds === null || seconds === undefined || seconds <= 0) {
      stringValue = '';
      return;
    }

    let remaining = seconds;
    let result = '';

    const units = Object.entries(multipliers).reverse();

    for (const [unit, multiplier] of units) {
      const unitValue = Math.floor(remaining / multiplier);
      if (unitValue > 0) {
        result += `${unitValue}${unit}`;
        remaining -= unitValue * multiplier;
      }
    }

    stringValue = result;
  });

  // handle input on focus out
  function processNumber() {
    if (!stringValue) {
      seconds = undefined;
      return;
    }

    stringValue = stringValue.toLowerCase().trim();
    if (
      stringValue === '' ||
      stringValue === 'perm' ||
      stringValue === 'permanent' ||
      stringValue === 'perma'
    ) {
      seconds = undefined;
      return;
    }

    let newSeconds = 0;
    const regex = /(\d+)(s|m|h|d|w|mon|y)/g;
    const matches = [...stringValue.matchAll(regex)];

    if (matches.length === 0) {
      seconds = undefined;
      return;
    }

    for (const match of matches) {
      const value = parseInt(match[1]);
      const unit = match[2];

      if (isNaN(value)) continue;
      newSeconds += value * (multipliers[unit as keyof typeof multipliers] || 0);
    }

    seconds = newSeconds;
  }
</script>

<input
  type="text"
  class="flex cursor-text items-center gap-2 rounded-lg {border
    ? 'border-2 border-zinc-300 dark:border-zinc-700'
    : ''} bg-zinc-100 dark:bg-zinc-800 p-1 px-2 transition-colors focus:bg-zinc-200 dark:focus:bg-zinc-600 {className}"
  placeholder="e.g. 5m, 1h30m, 2d"
  aria-label={aria}
  bind:value={stringValue}
  onfocusout={processNumber}
/>
