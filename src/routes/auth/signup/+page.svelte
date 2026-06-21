<script lang="ts">
  import Button from '$lib/components/ui/inputs/Button.svelte';
  import Text from '$lib/components/ui/inputs/Text.svelte';
  import { UserPlus } from '@lucide/svelte';
</script>

<h2 class="text-xl font-semibold text-zinc-100/80 -mb-1">DeviceGalaxy</h2>
<h1 class="text-4xl font-bold">Sign up</h1>
<p>It's great to have you! Enter your name, email address and a password to get started.</p>

<label class="text-base -mb-1 mt-2" for="name">Name</label>
<Text id="name" />

<label class="text-base -mb-1" for="email">Email Address</label>
<Text id="email" type="email" />

<label class="text-base -mb-1" for="password">Password</label>
<Text id="password" type="password" />

<label class="text-base -mb-1" for='confirm-password'>Confirm Password</label>
<Text id="confirm-password" type="password" />

<Button class="mt-2 flex gap-1 items-center justify-center" smallPadding={true}>
  <UserPlus size={18} /> Sign up
</Button>
