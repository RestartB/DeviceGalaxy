<script lang="ts">
  import UpdateNameForm from '$lib/components/forms/update_name/Form.svelte';
  import UpdateEmailForm from '$lib/components/forms/update_email/Form.svelte';
  import UpdatePFPForm from '$lib/components/forms/update_pfp/Form.svelte';

  import Avatar from '$lib/components/Avatar.svelte';

  // Get session from props
  const { data } = $props();

  let clientWidth = $state(0);

  let emailBlurred = $state(true);
</script>

<svelte:body bind:clientWidth />

<div class="flex flex-col gap-4">
  <h3 class="text-2xl font-bold">Account Settings</h3>

  <div class="flex flex-col gap-2">
    <h4 class="text-xl font-bold">Email</h4>

    <h5 class="font-semibold">View your login email address.</h5>
    <div>
      <button
        class="w-fit overflow-hidden rounded-lg border-2 border-zinc-400 bg-zinc-200 p-2 dark:bg-zinc-700"
        onclick={() => (emailBlurred = !emailBlurred)}
      >
        <p class="w-full blur-sm transition-all" class:blur-sm={emailBlurred}>
          {data.user?.email}
        </p>
      </button>
      <p class="mt-1 text-sm">Click to toggle</p>
    </div>

    <h5 class="font-semibold">Change your login email address.</h5>
    <UpdateEmailForm sourceForm={data.updateEmailForm} user={data.user} />
  </div>

  <hr class="w-full text-zinc-200 dark:text-zinc-700" />

  <div class="flex flex-col gap-2">
    <h4 class="text-xl font-bold">Name</h4>
    <h5 class="font-semibold">Change your display name.</h5>

    <UpdateNameForm sourceForm={data.updateNameForm} user={data.user} />
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
</div>
