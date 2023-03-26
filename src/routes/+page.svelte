<script>
	export let data
</script>

{#if !data.user}
	<form action="?/login" method="POST" class="flex flex-col items-start justify-start p-5">
		<label for="email">Email</label>
		<input type="email" name="email" id="email" />
		<label for="password">Password</label>
		<input type="password" name="password" id="password" />
		<button type="submit">Login</button>
	</form>
{:else}
	<form action="?/logout" method="POST" class="flex flex-row items-center gap-2.5 justify-start p-5 w-full h-20">
		<a href="/{data.user.username}" class="px-1 py-0.5">@{data.user.username}</a>
		<button type="submit" class="px-1 py-0.5">Logout</button>
	</form>
{/if}
