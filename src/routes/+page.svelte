<script>
	export let data
</script>

{#if !data.user}
	<form action="?/login" method="POST" class="flex flex-col items-start justify-start p-5 pt-4 bg-blue-500/25 border-b border-b-blue-500/25">
		<label for="email" class="block px-1.5 text-sm font-medium select-none">Email</label>
		<input type="email" name="email" id="email" class="block h-8 leading-8 mb-2 px-2 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" />
		<label for="password" class="block px-1.5 text-sm font-medium select-none">Password</label>
		<input type="password" name="password" id="password" class="block h-8 leading-8 mb-2 px-2 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" />
		<button type="submit" class="block h-8 leading-8 mt-1 px-3 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">Login</button>
	</form>
{:else}
	<form action="?/logout" method="POST" class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-20 px-5 overflow-auto bg-blue-500/50 border-b border-b-blue-500/25 shadow-[0_4px_0_hsla(220DEG,100%,50%,0.075)]">
		<a href="/{data.user.username}" class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">{data.user.username}</a>
		<button type="submit" class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">Logout</button>
	</form>
{/if}
