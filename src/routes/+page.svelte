<script>
	import "../app.postcss"
	import { _caret, _chat, _command, _file, _folder, _send } from "$lib/assets/svg"
	import { onMount } from "svelte"
	import Markdoc from "@markdoc/markdoc"
	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	export let data
	$: root = null
	$: side = null
	$: textarea = null
	$: messages = []
	onMount(() => {
		console.clear()
		console.log(data)
	})
	async function submit() {
		const prompt = textarea.value
		if (!prompt) return
		let response = await fetch("/ai", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				prompt
			})
		})
		let reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
		messages.push({
			role: "user",
			content: prompt,
			id: crypto.randomUUID()
		})
		messages = messages
		messages.push({
			role: "assistant",
			content: "",
			id: crypto.randomUUID()
		})
		textarea.value = ""
		textarea.focus()
		let stream = ""
		while (true) {
			let { done, value } = await reader.read()
			if (value) {
				stream += value
				console.clear()
				console.log(stream)
				messages.at(-1).content += value
				messages = messages
				root.scrollTo({
					top: root.scrollHeight,
					behavior: "smooth"
				})
			}
			if (done) {
				break
			}
		}
	}
</script>

<div class="relative h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]" class:overflow-y-hidden={side === "right"} bind:this={root}>
	<header class="z-50 sticky top-0 left-0 shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<div class="h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
			<div class="flex items-center gap-x-4 ml-auto">
				<button type="button" class="block lg:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
				<button type="button" class="block xl:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
			</div>
		</div>
	</header>

	<div class="relative z-0 mx-auto flex w-full max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
		<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent to-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)]" class:hidden={side !== "left"} />

		<main class="z-0 relative flex flex-col flex-1">
			<ul class="flex flex-col items-start justify-end w-full h-full min-h-[calc(100vh-11rem-4rem)] pb-6 lg:px-3 xl:bg-gradient-to-tl xl:from-[hsl(240DEG,6%,6%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-transparent">
				{#each messages as message (message.id)}
					{#if message.role === "assistant"}
						<li class="flex flex-row items-start justify-start pr-16">
							<div class="w-12 h-12 m-4 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50" />
							<div class="text-sm flex flex-col items-start justify-start pt-3 pr-4">
								<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm">{@html mark(message.content)}</div>
							</div>
						</li>
					{:else}
						<li class="flex flex-row items-start justify-start ml-auto pl-20">
							<div class="text-sm flex flex-col items-end justify-end pt-3 pr-4">
								<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm">{@html mark(message.content)}</div>
							</div>
							<div class="w-12 h-12 m-4 ml-0 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50" />
						</li>
					{/if}
				{/each}
			</ul>
			<form action="/ai" method="POST" class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-44 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] sm:bg-transparent xl:bg-gradient-to-t xl:from-[hsla(240DEG,6%,6%,90%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)]" on:submit|preventDefault={submit}>
				<div class="flex flex-row w-full h-full sm:px-4 md:pr-0 lg:pl-7 xl:pl-7 py-8">
					<label for="prompt" class="w-full h-full flex flex-row items-center justify-center">
						<span class="sr-only">prompt</span>
						<textarea id="prompt" type="text" name="prompt" bind:this={textarea} autocomplete="off" class="w-full h-full resize-none px-3 py-2.5 focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 rounded-sm" />
					</label>
					<div class="flex flex-row items-center justify-center h-full sm:aspect-[1/1] flex-1 ml-auto px-4 whitespace-nowrap">
						<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
							<img alt="send" src={_send} class="block w-5 h-auto" />
						</button>
					</div>
				</div>
			</form>
		</main>

		<aside class="w-screen sm:w-96 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-l from-transparent via-transparent via-60% to-[hsl(240DEG,6%,6%)] border-l border-l-[hsl(240DEG,6%,9%)]" class:hidden={side !== "right"} />
	</div>
</div>
