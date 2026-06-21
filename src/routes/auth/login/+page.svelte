<script lang="ts">
  import Button from '$lib/components/ui/inputs/Button.svelte';
  import Text from '$lib/components/ui/inputs/Text.svelte';
  import { LogIn } from '@lucide/svelte';
</script>

<h2 class="text-xl font-semibold text-zinc-100/80 -mb-1">DeviceGalaxy</h2>
<h1 class="text-4xl font-bold">Log in</h1>
<p>Welcome back! Please enter your username and password to log in.</p>

<label class="text-base -mb-1 mt-2" for="email">Email Address</label>
<Text id="email" type="email" />

<label class="text-base -mb-1" for="password">Password</label>
<Text id="password" type="password" />

<Button class="mt-2 flex gap-1 items-center justify-center" smallPadding={true}>
  <LogIn size={18} /> Log in
</Button>
