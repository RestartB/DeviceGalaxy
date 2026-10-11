<script lang="ts">
  import Collapsible from '#lib/components/ui/Collapsible.svelte';
  const { data } = $props();
</script>

{#each data.specs as spec (spec.id)}
  <Collapsible title={spec.name}>
    <ul>
      {#each spec.values as value (value.id)}
        <li>{value.value}</li>
      {/each}
    </ul>
  </Collapsible>
{/each}
