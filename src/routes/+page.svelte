<script>
	import { Auth } from "$lib/client/components"
	export let data
</script>

{#if data.user?.username}
	<form method="POST" class="fixed p-5">
		<a href="/$" class="px-2 py-1">Welcome back, {data.user.username}!</a>
		<button formaction="?/logout" class="px-2 py-1">Logout</button>
	</form>
{:else}
	<Auth />
{/if}
