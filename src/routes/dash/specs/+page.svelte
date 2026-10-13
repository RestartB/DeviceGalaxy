<script lang="ts">
  import SpecRow from '#lib/components/specs/SpecRow.svelte';
  const { data } = $props();
</script>

<ul class="space-y-4">
  {#each data.specs as spec (spec.id)}
    <SpecRow {spec} />
  {/each}
</ul>
