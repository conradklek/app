<script>
	import "../../app.postcss"
	import { _caret, _chat, _command, _file, _folder, _send } from "$lib/assets/svg"
	import { onMount } from "svelte"
	import Markdoc from "@markdoc/markdoc"
	import { enhance } from "$app/forms"
	import localforage from "localforage"
	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	$: mask = null
	$: root = null
	$: side = null
	$: agent = null
	function create_agent(name) {
		return {
			mask: null,
			messages: [],
			controls: {
				id: crypto.randomUUID(),
				name: name,
				system: "You are an AI assistant. If the user asks to translate something to emoji, format your response using only emojis. If the user does not ask to translate something to emoji, you may format your response using Markdown.",
				temperature: 0.7,
				topP: 1.0,
				frequencyPenalty: 0.0,
				presencePenalty: 0.0,
				maxTokens: 2048
			}
		}
	}
	$: agents = [create_agent("Emoji_Bot")]
	$: textarea = null
	onMount(async () => {
		console.clear()
		agents = (await localforage.getItem("agents")) || agents
		console.log(agents)
		if (!agents.length) {
			agents.push(create_agent("Emoji_Bot"))
			agents = agents
			await localforage.setItem("agents", agents)
		}
		let agent_id = await localforage.getItem("agent_id")
		let existing_agent = agents.find((agent) => agent.controls.id === agent_id)
		if (existing_agent) {
			agent = existing_agent
		} else {
			agent = agents[0]
		}
		mask = (await localforage.getItem("mask")) || mask
		queueMicrotask(() => {
			root.scrollTo({
				top: root.scrollHeight,
				behavior: "smooth"
			})
		})
	})
	async function submit() {
		const prompt = textarea.value
		if (!prompt) return
		agent.messages.push({
			role: "user",
			content: prompt,
			id: crypto.randomUUID()
		})
		agent = agent
		let response = await fetch("/ai", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				messages: agent.messages,
				controls: agent.controls,
				prompt
			})
		})
		let reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
		let message = {
			role: "assistant",
			content: "",
			id: crypto.randomUUID()
		}
		agent.messages.push(message)
		agent = agent
		textarea.value = ""
		textarea.focus()
		let stream = ""
		while (true) {
			let { done, value } = await reader.read()
			if (value) {
				stream += value
				console.clear()
				console.log(stream)
				message.content += value
				message = message
				agent = agent
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
	function handle_click() {
		function handle_image_file(file) {
			if (file.type.startsWith("image/")) {
				const reader = new FileReader()
				reader.onload = function (e) {
					console.log("Data URL:", e.target.result)
					localforage.setItem("mask", e.target.result).then(() => {
						mask = e.target.result
					})
				}
				reader.readAsDataURL(file)
			} else {
				console.error("Not an image file")
			}
		}
		const fileInput = document.createElement("input")
		fileInput.type = "file"
		fileInput.accept = "image/*"
		fileInput.style.display = "none"
		fileInput.addEventListener("change", (e) => {
			const files = e.target.files
			if (files.length > 0) {
				handle_image_file(files[0])
			}
		})
		fileInput.click()
	}
</script>

<svelte:window
	on:resize={() => {
		if (side !== null) {
			side = null
			root.scrollTo({
				top: root.scrollHeight,
				behavior: "smooth"
			})
		}
	}}
/>

<div class="relative h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]" class:overflow-y-hidden={side === "right"} bind:this={root}>
	<header class="z-50 sticky top-0 left-0 shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<a href="/" class="h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
				<span class="sr-only">Home</span>
				{#if mask}
					<img id="image" src={mask} class="w-full h-full object-cover rounded-sm" alt="User Uploaded Mask" />
				{/if}
			</a>
			{#if agent}
				<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-1.5">
					<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
						<img alt="caret" src={_caret} class="block w-2 h-auto" />
					</div>
					<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
						{agent.controls.name || "Agent"}
					</div>
				</nav>
			{/if}
			<div class="flex items-center gap-x-4 ml-auto">
				<button type="button" class="block lg:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (side = side === "left" ? null : "left")} />
				<button type="button" class="block xl:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (side = side === "right" ? null : "right")} />
			</div>
		</div>
	</header>
	{#if agent}
		<div class="relative z-0 mx-auto flex w-screen max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
			<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent to-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)]" class:hidden={side !== "left"}>
				<form
					class="flex flex-col items-start justify-start w-full p-5"
					on:submit|preventDefault={async (e) => {
						if (e.target.agentName.value) {
							if (agents.find((agent) => agent.controls.name === e.target.agentName.value)) {
								return console.log("Agent already exists")
							}
							agents.push(create_agent(e.target.agentName.value))
							e.target.agentName.value = ""
							agents = agents
							await localforage.setItem("agents", agents)
						}
					}}
				>
					<label for="agentName" class="sr-only">Agents</label>
					<div class="w-full flex flex-row items-center justify-center bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] rounded-sm shadow shadow-black/50">
						<input id="agentName" name="agentName" type="text" autocomplete="off" class="w-full h-10 px-2.5 rounded-l-sm focus:outline-none bg-transparent border-r border-r-[hsl(240DEG,6%,9%)]" />
						<button type="submit" class="flex items-center justify-center h-10 px-2.5 rounded-r-sm whitespace-nowrap focus:outline-none select-none tracking-wide">Create</button>
					</div>
				</form>
				<ul class="grid grid-cols-1 gap-2.5 px-5 pb-5">
					{#each agents as item (item.controls.name)}
						<li class="flex flex-row items-center justify-start w-full h-10 col-span-1 gap-2">
							<div class="flex items-center justify-center h-full aspect-[1/1] rounded-sm cursor-grab bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
								{#if agent?.id === item.id && agent.mask}
									<img alt={item.controls.name} src="data:image/png;base64,{agent.mask}" class="pointer-events-none object-cover rounded-sm" />
								{:else if item.mask}
									<img alt={item.controls.name} src="data:image/png;base64,{item.mask}" class="pointer-events-none object-cover rounded-sm" />
								{/if}
							</div>
							<button
								type="button"
								class="w-full h-full p-0.5 pl-2.5 text-left line-clamp-1 focus:outline-none select-none rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
								on:click={async () => {
									agent = item
									await localforage.setItem("agent_id", item.controls.id)
									queueMicrotask(() => {
										root.scrollTo({
											top: root.scrollHeight,
											behavior: "smooth"
										})
									})
								}}
							>
								{item.controls.name}
							</button>
						</li>
					{/each}
				</ul>
			</aside>
			<main class="z-0 relative flex flex-col flex-1 shrink-0 sm:translate-x-0" class:translate-x-60={side === "left"} class:-traslate-x-96={side === "right"}>
				<ul class="flex flex-col items-start justify-end w-full max-w-[calc(1280px-15rem-24rem)] h-full min-h-[calc(100vh-11rem-4rem)] pb-6 lg:px-3 xl:bg-gradient-to-tl xl:from-[hsl(240DEG,6%,6%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-transparent overflow-x-auto">
					{#each agent.messages as message (message.id)}
						{#if message.role === "assistant"}
							<li class="flex flex-row items-start justify-start pr-16">
								<div class="w-12 h-12 m-4 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50">
									{#if agent.mask}
										<img id="image" src="data:image/png;base64,{agent.mask}" class="w-full h-full object-cover rounded-sm" alt="Dall-e Generated Mask" />
									{/if}
								</div>
								<div class="text-sm flex flex-col items-start justify-start pt-2.5 pr-4">
									<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm [&_pre]:max-w-sm [&_pre]:overflow-x-auto">{@html mark(message.content)}</div>
								</div>
							</li>
						{:else}
							<li class="flex flex-row items-start justify-start ml-auto pl-20">
								<div class="text-sm flex flex-col items-end justify-end pt-2.5 pr-4">
									<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm [&_pre]:max-w-sm [&_pre]:overflow-x-auto">{@html mark(message.content)}</div>
								</div>
								<div class="w-12 h-12 m-4 ml-0 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50" on:click={handle_click} on:keyup={handle_click}>
									{#if mask}
										<img id="image" src={mask} class="w-full h-full object-cover rounded-sm" alt="User Uploaded Mask" />
									{/if}
								</div>
							</li>
						{/if}
					{/each}
				</ul>
				<form action="/ai" method="POST" class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-44 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] sm:bg-transparent xl:bg-gradient-to-t xl:from-[hsla(240DEG,6%,6%,90%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)]" on:submit|preventDefault={submit}>
					<div class="flex flex-row items-center w-full h-44 sm:px-4 md:pr-0 lg:pl-7 xl:pl-7 py-8">
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
			<aside class="w-screen sm:w-96 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-l from-transparent via-transparent via-60% to-[hsl(240DEG,6%,6%)] border-l border-l-[hsl(240DEG,6%,9%)]" class:hidden={side !== "right"}>
				<form
					action="/ai/dall-e"
					method="POST"
					use:enhance={async () => {
						return async ({ result, data, cancel }) => {
							const profile = data.get("profile")
							if (!profile.length) cancel()
							if (result["b64_json"]) {
								agent.mask = result["b64_json"]
								agent = agent
							}
						}
					}}
					class="flex flex-col gap-2.5 p-4"
				>
					<div class="flex flex-col items-start justify-start gap-2.5">
						<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
							<div class="flex flex-row w-24 h-24 aspect-square rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
								{#if agent.mask}
									<img id="image" src="data:image/png;base64,{agent.mask}" class="w-full h-full object-cover rounded-sm" alt="Dall-e Generated Mask" />
								{/if}
							</div>
							<div class="flex flex-col w-full h-24">
								<input type="text" bind:value={agent.controls.name} class="block w-full h-full text-lg font-medium text-[hsl(240DEG,6%,90%)] bg-transparent focus:outline-none" />
								<div class="pb-1.5 text-sm text-[hsl(240DEG,8%,32%)]">
									{agent.messages.length} message(s)
								</div>
								<div class="w-full h-full flex flex-row items-end justify-end gap-2.5">
									<div class="grid grid-cols-2 gap-x-2 w-full">
										<button
											type="button"
											class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
											on:click={async () => {
												if (!agent.id) {
													agent.id = crypto.randomUUID()
													agents = agents
												}
												await localforage.setItem("agents", agents)
											}}
										>
											Save
										</button>
										{#if agents.length > 1}
											<button
												type="button"
												class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
												on:click={async () => {
													agents.splice(agents.indexOf(agent), 1)
													await localforage.setItem("agents", agents)
													agent = agents[0]
												}}
											>
												Delete
											</button>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<label for="profile" class="h-24 flex flex-col items-start justify-end w-full">
							<span class="sr-only">Profile image</span>
							<textarea id="profile" name="profile" rows="5" spellcheck="false" class="w-full p-2 rounded-sm focus:outline-none text-sm text-[hsl(240DEG,8%,32%)] focus:text-white bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" bind:value={agent.controls["profile"]} />
						</label>
					</div>
					<button type="submit" class="w-full h-10 leading-10 ml-auto px-4 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Generate Image</button>
				</form>
				<div class="flex flex-col p-4 pt-3 pb-5">
					<div class="flex flex-col mb-5">
						<label for="system" class="pb-1.5 text-sm text-white focus:text-white mb-0.5 px-1.5">System Message</label>
						<div class="mb-2 p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">The system message that defines the character.</div>
						<textarea id="system" rows="7" class="px-2.5 py-1 rounded-sm focus:outline-none text-sm text-[hsl(240DEG,8%,32%)] focus:text-white bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" bind:value={agent.controls["system"]} />
					</div>
					<div class="flex flex-col">
						<label for="temperature" class="flex flex-row-reverse items-center justify-end gap-2.5 mb-2">
							<span class="pb-1.5 text-sm text-white focus:text-white">Temperature</span>
							<input id="temperature" type="number" min="0" max="1" step="0.1" bind:value={agent.controls["temperature"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
						</label>
						<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.</div>
					</div>
					<div class="flex flex-col">
						<label for="topP" class="flex flex-row-reverse items-center justify-end gap-2.5 mb-2">
							<span class="pb-1.5 text-sm text-white focus:text-white">Top P</span>
							<input id="topP" type="number" min="0" max="1" step="0.1" bind:value={agent.controls["topP"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
						</label>
						<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.</div>
					</div>
					<div class="flex flex-col">
						<label for="frequencyPenalty" class="flex flex-row-reverse items-center justify-end gap-2.5 mb-2">
							<span class="pb-1.5 text-sm text-white focus:text-white">Frequency Penalty</span>
							<input id="frequencyPenalty" type="number" min="0" max="1" step="0.1" bind:value={agent.controls["frequencyPenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
						</label>
						<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.</div>
					</div>
					<div class="flex flex-col">
						<label for="presencePenalty" class="flex flex-row-reverse items-center justify-end gap-2.5 mb-2">
							<span class="pb-1.5 text-sm text-white focus:text-white">Presence Penalty</span>
							<input id="presencePenalty" type="number" min="0" max="1" step="0.1" bind:value={agent.controls["presencePenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
						</label>
						<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.</div>
					</div>
					<div class="flex flex-row mt-5 pb-2.5">
						<button type="button" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (agent.messages = [])}>Clear Messages</button>
					</div>
				</div>
			</aside>
		</div>
	{/if}
</div>
