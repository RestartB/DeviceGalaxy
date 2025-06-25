<script lang="ts">
    import { authClient } from '$lib/client';
    const session = authClient.useSession();
</script>

<h1>Welcome back!</h1>
<p>Hi there, {$session.data?.user.name}! What do you want to do?</p>
