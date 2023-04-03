<script>
	import { messages } from "$lib/client/stores"
	import { _send } from "$lib/assets/svg"
	import { enhance } from "$app/forms"
	export let data
	export let form
	let textarea
	$: prompt = ""
	$: {
		console.log(data)
		console.log(form)
	}
</script>

{#if !data.user}
	<form action="/?/login" method="POST" class="flex flex-col items-start justify-start p-5 pt-4 bg-blue-500/25 border-b border-b-blue-500/25">
		<label for="email" class="block px-1.5 text-sm font-medium select-none">Email</label>
		<input type="email" name="email" id="email" class="block h-8 leading-8 mb-2 px-2 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" />
		<label for="password" class="block px-1.5 text-sm font-medium select-none">Password</label>
		<input type="password" name="password" id="password" class="block h-8 leading-8 mb-2 px-2 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" />
		<button type="submit" class="block h-8 leading-8 mt-1 px-3 rounded-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">Submit</button>
	</form>
{:else}
	<form action="/?/logout" method="POST" class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-20 px-5 overflow-auto bg-blue-500/50 border-b border-b-blue-500/25 shadow-[0_4px_0_hsla(220DEG,100%,50%,0.075)]">
		<a href="/{data.user.username}" class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">{data.user.username}</a>
		<button type="submit" class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">Logout</button>
	</form>
	<main class="flex flex-col-reverse gap-2 w-screen h-[calc(100vh-10rem)] pb-4 overflow-x-hidden overflow-y-auto shadow-[inset_0_-4px_0_hsla(220DEG,100%,50%,0.075)]">
		{#each [...$messages].reverse() as message (message.id)}
			<article class="flex flex-col items-start justify-start w-[calc(100vw-1.25rem)] mx-auto p-2.5 bg-white rounded-sm">
				<div class="flex flex-row items-center justify-between gap-1 w-full p-1">
					<span class="px-1">{message.role}</span>
				</div>
				<div class="flex flex-row items-center justify-between gap-1 w-full p-1">
					<span class="px-1">{message.content}</span>
				</div>
			</article>
		{/each}
	</main>
	<form
		action="/$/ai/zapier"
		method="POST"
		use:enhance={async ({ form, data }) => {
			data.set("messages", JSON.stringify($messages))
			return async ({ result }) => {
				form.reset()
				textarea.focus()
				result = await result
				if (result.type === "success") {
					$messages = JSON.parse(result.message).messages
				} else {
					console.log(result)
				}
			}
		}}
		class="sticky bottom-0 right-0 flex flex-row items-end w-full h-20 bg-white"
	>
		<label for="message" class="w-full h-full flex flex-row items-center justify-center">
			<span class="sr-only">prompt</span>
			<textarea id="prompt" type="text" name="prompt" autocomplete="off" class="w-full h-full resize-none p-2.5 focus:outline-none" bind:this={textarea} bind:value={prompt} />
		</label>
		<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap bg-blue-500/50">
			<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">
				<img alt="send" src={_send} />
			</button>
		</div>
	</form>
{/if}
