<script lang="ts">
  import Form from '$lib/components/forms/edit_description/Form.svelte';

  // Get session from props
  const { data } = $props();
</script>

<svelte:body />

{#if data.user}
  <div class="flex flex-col gap-4">
    <h3 class="text-2xl font-bold">Account Settings</h3>

    <div class="flex flex-col gap-2">
      <h4 class="text-xl font-bold">Description</h4>

      <p class="font-semibold">Set a description that appears on account share links.</p>
      <Form
        sourceForm={data.descriptionForm}
        oldDescription={data.user.description}
      />
    </div>
  </div>
{/if}