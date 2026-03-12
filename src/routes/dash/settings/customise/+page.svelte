<script lang="ts">
  import EditDescriptionForm from '$lib/components/forms/edit_description/Form.svelte';
  import UpdatePFPForm from '$lib/components/forms/update_pfp/Form.svelte';
  import UpdateBackgroundForm from '$lib/components/forms/update_background/Form.svelte';

  import Avatar from '$lib/components/Avatar.svelte';

  // Get session from props
  const { data } = $props();
  let clientWidth = $state(0);
</script>

<svelte:body bind:clientWidth />

{#if data.user}
  <div class="flex flex-col gap-4">
    <h3 class="text-2xl font-bold">Customise</h3>

    <div class="flex flex-col gap-2">
      <h4 class="text-xl font-bold">Description</h4>

      <p>Set a description that appears on account share links.</p>
      <EditDescriptionForm
        sourceForm={data.descriptionForm}
        oldDescription={data.user.description}
      />
    </div>

    <hr class="w-full text-zinc-200 dark:text-zinc-700" />

    <div class="flex flex-col gap-2">
      <h4 class="text-xl font-bold">Profile Picture</h4>
      <h5 class="font-semibold">Edit your profile picture.</h5>

      <div class="flex items-center gap-2">
        <Avatar
          size={clientWidth > 640 ? 120 : 60}
          src={data.user?.image || ''}
          name={data.user?.name || ''}
          alt="User Avatar"
          className="border-zinc-400"
          textClass="text-3xl sm:text-6xl"
        />

        <UpdatePFPForm sourceForm={data.profilePictureForm} user={data.user} />
      </div>
    </div>

    <hr class="w-full text-zinc-200 dark:text-zinc-700" />

    <div class="flex flex-col gap-2">
      <h4 class="text-xl font-bold">Share Background</h4>
      <h5 class="font-semibold">Set a background to show on account share links.</h5>

      <UpdateBackgroundForm sourceForm={data.backgroundForm} user={data.user} />
    </div>
  </div>
{/if}
