<script lang="ts">
  let {
    value = $bindable(),
    min = undefined,
    max = undefined,
    integer = true,
    border = true,
    class: className = '',
    aria = ''
  }: {
    value?: number;
    min?: number;
    max?: number;
    integer?: boolean;
    border?: boolean;
    class?: string;
    aria?: string;
  } = $props();

  // only allow numbers and decimals
  function processNumber(event: Event) {
    const input = event.target as HTMLInputElement;

    let numericValue;
    if (integer) {
      numericValue = Number(input.value.replace(/[^\d-]/g, ''));
    } else {
      const normalized = input.value.replace(/,/g, '.').replace(/[^\d.-]/g, '');
      numericValue = Number(normalized);
    }

    if (isNaN(numericValue)) {
      value = 0;
    } else {
      if (min !== undefined && numericValue < min) {
        value = min;
      } else if (max !== undefined && numericValue > max) {
        value = max;
      } else {
        value = numericValue;
      }
    }
  }
</script>

<input
  type="text"
  class="flex cursor-text items-center gap-2 rounded-lg {border
    ? 'border-2 border-zinc-300 dark:border-zinc-700'
    : ''} bg-zinc-100 dark:bg-zinc-800 p-1 px-2 transition-colors focus:bg-zinc-200 dark:focus:bg-zinc-600 {className}"
  aria-label={aria}
  bind:value
  onfocusout={processNumber}
/>
