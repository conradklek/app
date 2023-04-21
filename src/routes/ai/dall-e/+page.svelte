<script>
	import { _caret, _chat, _command, _file, _folder, _send, _copy } from "$lib/assets/svg"
	import { Slider } from "$lib/components"
	import { onMount } from "svelte"
	import localforage from "localforage"
	$: root = null
	$: side = null
	$: controls = {
		n: 6,
		size: "512x512"
	}
	$: selected = null
	function scroll_down() {
		queueMicrotask(() => {
			root.scrollTo({
				top: root.scrollHeight,
				behavior: "smooth"
			})
		})
	}
	$: messages = []
	onMount(async () => {
		messages = await localforage.getItem("dall-e")
		if (!messages?.length) {
			messages = []
			await localforage.setItem("dall-e", messages)
		}
		scroll_down()
	})
	$: {
		console.clear()
		console.log(messages)
		console.log(controls)
		console.log(selected)
	}
</script>

<div class="relative h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]" class:overflow-y-hidden={side === "right"} bind:this={root}>
	<header class="z-50 sticky top-0 left-0 shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<a href="/ai" class="grid place-items-center h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
				<span class="sr-only">AI Home</span>
				<span class="text-lg select-none translate-y-px">🖼️</span>
			</a>
			<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-1.5">
				<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
					<img alt="caret" src={_caret} class="block w-2 h-auto" />
				</div>
				<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 tracking-wide whitespace-nowrap">Dall-E</div>
			</nav>
			<div class="flex items-center gap-x-4 ml-auto">
				<button type="button" class="grid place-items-center lg:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (side = side === "left" ? null : "left")}>
					<img src={_caret} class="block w-2 h-auto -rotate-180 transition-transform duration-200" alt="left side menu toggle" class:rotate-0={side === "left"} />
				</button>
				<button type="button" class="grid place-items-center xl:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (side = side === "right" ? null : "right")}>
					<img src={_caret} class="block w-2 h-auto transition-transform duration-200" alt="right side menu toggle" class:-rotate-180={side === "right"} />
				</button>
			</div>
		</div>
	</header>
	<div class="relative z-0 mx-auto flex w-full max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
		<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent to-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)]" class:hidden={side !== "left"}>
			<div class="p-5 lg:pl-0">
				<Slider bind:value={controls.n} min="1" max="6" step="1" label="Images:" />
			</div>
		</aside>
		<main class="z-0 relative flex flex-col items-end justify-end flex-1 shrink-0 min-h-full sm:translate-x-0" class:translate-x-60={side === "left"} class:-traslate-x-96={side === "right"}>
			<ul class="flex flex-col items-start justify-end gap-1 w-full max-w-[calc(1280px-15rem-24rem)] h-full min-h-[calc(100vh-11rem-4rem)] pb-6 lg:px-3 xl:bg-gradient-to-tl xl:from-[hsl(240DEG,6%,6%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-transparent overflow-x-auto">
				{#each messages as message (message.id)}
					<li class="relative grid grid-cols-6 gap-1 w-full">
						{#each message.content as image (image.id)}
							<button
								type="button"
								class="z-0 relative grid place-items-center col-span-1 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50"
								on:click={() => {
									if (selected) {
										if (selected.message.id === message.id && selected.image.id === image.id) {
											selected = null
										} else {
											selected = { message, image }
										}
									} else {
										selected = { message, image }
									}
								}}
								draggable="true"
								on:dragover|preventDefault
								on:dragstart={(e) => {
									if (selected?.message.id === message.id && selected?.image.id === image.id) {
										selected = null
									}
									e.dataTransfer.setData("text/plain", JSON.stringify({ message: message.id, image: image.id }))
								}}
								on:drop|preventDefault={async (e) => {
									let data = JSON.parse(e.dataTransfer.getData("text/plain"))
									console.log(data)
									let message_index = messages.findIndex((m) => m.id === data.message)
									let image_index = messages[message_index].content.findIndex((i) => i.id === data.image)
									console.log(message_index, image_index)
									let this_message_index = messages.findIndex((m) => m.id === message.id)
									let this_image_index = messages[this_message_index].content.findIndex((i) => i.id === image.id)
									console.log(this_message_index, this_image_index)
									if (message_index === this_message_index) {
										let temp = messages[this_message_index].content[this_image_index]
										messages[this_message_index].content[this_image_index] = messages[this_message_index].content[image_index]
										messages[this_message_index].content[image_index] = temp
										messages = messages
										await localforage.setItem("dall-e", messages)
										if (selected?.message.id === message.id && selected?.image.id === image.id) {
											selected = null
										}
									} else if (message.content.length < 6) {
										let temp = messages[message_index].content[image_index]
										messages[message_index].content.splice(image_index, 1)
										messages[this_message_index].content.splice(this_image_index, 0, temp)
										messages = messages
										await localforage.setItem("dall-e", messages)
										if (selected?.message.id === message.id && selected?.image.id === image.id) {
											selected = null
										}
									}
								}}
							>
								<img id="image" src="data:image/png;base64,{image['b64_json']}" class="object-cover rounded-sm" alt={message.id} />
							</button>
						{/each}
						{#if selected?.message.id === message.id && selected.message.content.length < 6}
							<button
								type="button"
								class="z-10 absolute top-1/2 -translate-y-4 right-2 grid place-items-center w-8 h-8 rounded-full focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50"
								on:click={async () => {
									let new_image = { ...selected.image, id: crypto.randomUUID() }
									selected.message.content.push(new_image)
									messages.find((m) => m.id === selected.message.id).content = selected.message.content
									await localforage.setItem("dall-e", messages)
									messages = await localforage.getItem("dall-e")
								}}
							>
								<img src={_copy} class="w-4 h-auto" alt="copy" />
							</button>
						{/if}
					</li>
				{/each}
			</ul>
			<form
				class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-44 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] sm:bg-transparent xl:bg-gradient-to-t xl:from-[hsla(240DEG,6%,6%,90%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)]"
				action="/ai/dall-e"
				method="POST"
				on:submit|preventDefault={async (e) => {
					const result = await fetch("/ai/dall-e", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							prompt: e.target.elements.prompt.value,
							size: controls.size,
							n: controls.n
						})
					})
					let json = await result.json()
					for (let img of json.data) {
						img.id = crypto.randomUUID()
						img.alt = e.target.elements.prompt.value
					}
					messages.push({
						id: crypto.randomUUID(),
						content: json.data,
						controls
					})
					messages = messages
					await localforage.setItem("dall-e", messages)
					scroll_down()
					e.target.elements.prompt.value = ""
					e.target.elements.prompt.focus()
				}}
			>
				<div class="flex flex-row items-center w-full h-44 sm:px-4 md:pr-0 lg:pl-7 xl:pl-7 py-8">
					<label for="prompt" class="w-full h-full flex flex-row items-center justify-center">
						<span class="sr-only">prompt</span>
						<textarea id="prompt" type="text" name="prompt" autocomplete="off" class="w-full h-full resize-none px-3 py-2.5 focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 rounded-sm" />
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
			{#if selected}
				<form
					action="/ai/dall-e"
					method="POST"
					class="flex flex-col items-start justify-start gap-2.5 p-4"
					on:submit|preventDefault={async () => {
						const result = await fetch("/ai/dall-e", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								prompt: selected.image.alt,
								size: "512x512",
								n: 4
							})
						})
						let json = await result.json()
						for (let img of json.data) {
							img.id = crypto.randomUUID()
							img.alt = selected.image.alt
						}
						selected.options = json.data
					}}
				>
					<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
						<div class="flex flex-row w-24 h-24 aspect-square rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
							<img id="image" src="data:image/png;base64,{selected.image['b64_json']}" class="w-full h-full object-cover rounded-sm" alt={selected.image.alt} />
						</div>
						<div class="flex flex-col w-full h-24">
							{#if selected.options?.length}
								<div class="flex flex-row items-center justify-between gap-1 w-full h-14">
									{#each selected.options as option}
										<button
											type="button"
											class="w-full aspect-[1/1] rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 overflow-hidden"
											on:click={async () => {
												selected.image["b64_json"] = option["b64_json"]
												delete selected.options
												selected = selected
												selected.message.content.find((img) => img.id === selected.image.id)["b64_json"] = option["b64_json"]
												selected = selected
												messages.find((message) => message.id === selected.message.id).content.find((img) => img.id === selected.image.id)["b64_json"] = option["b64_json"]
												messages = messages
												await localforage.setItem("dall-e", messages)
											}}
										>
											<img src="data:image/png;base64,{option['b64_json']}" class="w-full object-cover" alt={option.alt} />
										</button>
									{/each}
								</div>
							{/if}
							<div class="w-full h-full flex flex-row items-end justify-end gap-2.5">
								<div class="grid grid-cols-2 gap-x-2 w-full">
									{#if selected.options?.length}
										<button
											type="button"
											class="w-full h-9 leading-9 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
											on:click={() => {
												delete selected.options
												selected = selected
											}}>Cancel</button
										>
									{:else}
										<button type="submit" class="w-full h-9 leading-9 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Retry</button>
									{/if}
									<button
										type="button"
										class="w-full h-9 leading-9 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
										on:click={async () => {
											if (selected.message.content.length === 1) {
												messages = messages.filter((message) => message.id !== selected.message.id)
												selected = null
											} else {
												let index = selected.message.content.findIndex((image) => image.id === selected.image.id)
												selected.message.content = selected.message.content.filter((image) => image.id !== selected.image.id)
												messages.find((message) => message.id === selected.message.id).content = selected.message.content
												messages = messages
												if (index === 0) {
													selected = {
														message: selected.message,
														image: selected.message.content[0]
													}
												} else {
													selected = {
														message: selected.message,
														image: selected.message.content[index - 1]
													}
												}
											}
											await localforage.setItem("dall-e", messages)
										}}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
					<label for="alt" class="h-24 flex flex-col items-start justify-end w-full">
						<span class="sr-only">Image</span>
						<textarea id="alt" name="alt" rows="5" spellcheck="false" bind:value={selected.image.alt} class="w-full p-2.5 rounded-sm focus:outline-none text-sm text-[hsl(240DEG,8%,32%)] focus:text-white bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
					</label>
				</form>
			{/if}
		</aside>
	</div>
</div>
