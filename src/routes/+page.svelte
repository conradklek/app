<script>
	import { _caret, _chat, _command, _file, _folder, _send } from "$lib/assets/svg"
	import { onMount } from "svelte"
	import { Anon, Mask, Open } from "$lib/client/components"
	import { enhance } from "$app/forms"
	import { invalidateAll } from "$app/navigation"
	import Markdoc from "@markdoc/markdoc"
	import { app, lib } from "$lib/client/stores"
	import { page } from "$app/stores"
	import ansiRegex from "ansi-regex"
	export let data

	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	$: stream = ""
	async function send() {
		if (!$app.agent) {
			let prompt = $app.textarea.value
			if (!$lib.writer) $lib.writer = $lib.terminal.input.getWriter()
			if (!$lib.init) {
				$app.messages.push({ role: "user", content: prompt, id: crypto.randomUUID(), date: new Date().toISOString() })
				$app = $app
				let response = await fetch("/$/ai", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ prompt, messages: $app.messages })
				})
				if (!response.status === 200) return
				$app.textarea.value = ""
				$app.textarea.focus()
				let reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
				let message = { role: "assistant", content: "", id: crypto.randomUUID(), date: new Date().toISOString() }
				$app.messages.push(message)
				$app = $app
				while (true) {
					let { done, value } = await reader.read()
					if (value) {
						message.content += value
						$app = $app
						$app.root.scrollTo(0, $app.root.scrollHeight)
					}
					if (done) break
				}
			}
			return
		}
		try {
			let prompt = $app.textarea.value
			let userMessage = { role: "user", content: prompt, id: crypto.randomUUID(), date: new Date().toISOString() }
			let response = await fetch("/$/ai/gpt-4", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ controls: $app.agent.controls, messages: [...$app.agent.messages, userMessage], prompt, agent: $app.agent ? $app.agent.name : null })
			})
			if (!response.ok) return
			$app.agent.messages.push(userMessage)
			$app = $app
			let message = { role: "assistant", content: "", id: crypto.randomUUID(), date: new Date().toISOString() }
			$app.agent.messages.push(message)
			$app = $app
			$app.textarea.value = ""
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
			while (true) {
				const { value, done } = await reader.read()
				if (value) {
					if (!message.content.length && (value.startsWith("?") || value.startsWith("!"))) {
						message.content = "..."
					} else {
						if (message.content === "...") message.content = ""
						message.content += value
					}
					$app = $app
					$app.root.scrollTo(0, $app.root.scrollHeight)
				}
				if (done) break
			}
			$app.textarea.focus()
			await invalidateAll()
		} catch (e) {
			console.log(e)
		}
	}
	async function init() {
		const process = await $lib.host.spawn("jsh")
		process.output.pipeTo(
			new WritableStream({
				async write(data) {
					if (!$lib.init) return (stream = "")
					stream += data
					if (stream.endsWith("[?25h")) {
						stream = stream.replace(ansiRegex(), "")
						$app.messages.at(-1).content = "```\n" + stream.split("\n").slice(0, -2).join("\n").trim() + "\n```"
						stream = ""
						$app = $app
						$lib.init = false
						await invalidateAll()
						$lib.data = await read("/")
						$lib = $lib
						console.log($app.messages)
						$app.root.scrollTo(0, $app.root.scrollHeight)
					}
				}
			})
		)
		return process
	}
	async function read(path) {
		const obj = {}
		const dir = await $lib.host.fs.readdir(path, { withFileTypes: true })
		for (const file of dir) {
			if (file.isDirectory()) {
				if (file.name === "node_modules" || file.name.startsWith(".") || file.name === "pnpm-lock.yaml") continue
				obj[file.name] = { directory: await read(`${path}/${file.name}`) }
			} else if (file.isFile()) {
				obj[file.name] = {
					file: {
						contents: await $lib.host.fs.readFile(`${path}/${file.name}`, "utf8")
					}
				}
			}
		}
		return obj
	}
	onMount(async () => {
		let response = await fetch("/$/db/conradklek", {
			method: "GET"
		})
		console.log(response)
		console.log(await response.json())
		response = await fetch("/$/db/conradklek/library/index.html", {
			method: "GET"
		})
		console.log(response)
		console.log(await response.json())
		if (data.user) {
			if (!$lib.data) {
				$lib.data = data.user.data
			}
			if (!$lib.host) {
				try {
					const { WebContainer } = await import("@webcontainer/api")
					$lib.host = await WebContainer.boot()
					await $lib.host.mount(data.user.data)
					$lib.terminal = await init()
				} catch (e) {
					console.log(e)
				}
			}
		}
	})
</script>

<svelte:window
	on:resize={() => {
		if ($app.side !== null) {
			$app.side = null
			$app = $app
		}
	}}
/>

{#if !data.user}
	<div class="relative z-10 block sm:flex sm:flex-row">
		<section class="z-0 sticky top-0 left-0 inline-flex sm:flex flex-col items-start justify-start w-screen sm:w-1/2 min-h-screen sm:p-5 bg-[hsla(242DEG,50%,2%,1)]">
			<h1 class="flex flex-col items-start justify-start w-full p-5 text-white text-6xl leading-[3.75rem] font-thin select-none">
				<div>Sentience</div>
				<div>as a Service</div>
			</h1>
			<h2 class="relative px-5 text-white text-sm tracking-wide select-none">
				<span class="font-regular">Artificial Intelligence</span>
				<span class="block lg:inline font-light">&#8212; tailored to fit your every need</span>
				<div class="absolute -bottom-0.5 -left-5 -translate-x-0.5 w-full h-0.5 bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent via-transparent via-40% to-[hsla(242DEG,100%,42%,1)]" />
			</h2>
			<form action="/?/login" method="POST" class="sticky bottom-0 right-0 flex flex-row items-center justify-center gap-x-2.5 h-28 mt-auto p-5 pt-0 bg-[hsla(242DEG,50%,2%,1)]">
				<div class="flex flex-col items-start justify-start">
					<label for="email" class="block mb-0.5 px-1 text-sm font-light tracking-wide select-none text-white">Email</label>
					<input type="email" name="email" id="email" autocomplete="off" class="block w-full h-8 leading-8 font-light mb-2 px-1.5 text-[hsla(253DEG,15%,98%,1)] bg-transparent border-b-2 border-b-[hsla(253DEG,15%,98%,1)] focus:border-b-[hsla(242DEG,100%,42%,1)] focus:outline-none" />
				</div>
				<div class="flex flex-col items-start justify-start">
					<label for="password" class="block mb-0.5 px-1 text-sm font-light tracking-wide select-none text-white">Password</label>
					<input type="password" name="password" id="password" autocomplete="off" class="block w-full h-8 leading-8 font-light mb-2 px-1.5 text-[hsla(253DEG,15%,98%,1)] bg-transparent border-b-2 border-b-[hsla(253DEG,15%,98%,1)] focus:border-b-[hsla(242DEG,100%,42%,1)] focus:outline-none" />
				</div>
				<button type="submit" class="flex items-center justify-center h-8 leading-8 font-light tracking-wide mt-3.5 px-1.5 text-white bg-transparent border-b-2 border-b-[hsla(253DEG,15%,98%,1)] focus:border-b-[hsla(242DEG,100%,42%,1)] focus:outline-none">Login</button>
			</form>
		</section>
		<main id="about" class="z-10 relative inline-flex sm:flex flex-col sm:justify-between w-screen sm:w-1/2 min-h-screen py-5 bg-[hsla(242DEG,100%,42%,1)]">
			<h3 class="flex flex-row items-center justify-center w-screen my-5 text-center text-white text-2xl font-light tracking-wider whitespace-nowrap select-none overflow-hidden">General Purpose Technologies &bull;General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies &bull; General Purpose Technologies</h3>
			<p class="w-full p-5 sm:p-10 text-white font-light tracking-wide select-none">We are a small team of engineers and designers who are passionate about AI and robotics. We believe that AI is the next big leap for humanity. We are working to make that future accessible to all.</p>
		</main>
	</div>
	<section id="signup" class="relative z-20 w-screen min-h-[50vh] bg-[hsla(236DEG,28%,92%,1)]" />
{:else}
	<div class="relative h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]" class:overflow-y-hidden={$app.side === "right" || $lib.open} class:xl:overflow-y-hidden={$lib.open} bind:this={$app.root}>
		<header class="z-50 sticky top-0 left-0 shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
			<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
				<button
					type="button"
					on:click={() => {
						$app.agent = null
						$app = $app
					}}
					class="h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
				/>
				<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-1.5">
					<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
						<img alt="caret" src={_caret} class="block w-2 h-auto" />
					</div>
					<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
						{#if $app.agent}
							{$app.agent.name.slice(0, -4)}
						{:else}
							{$page.data.user.username}
						{/if}
					</div>
				</nav>
				<div class="flex items-center gap-x-4 ml-auto">
					<button
						type="button"
						class="block lg:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
						on:click={() => {
							$app.side = $app.side === "left" ? null : "left"
							$app = $app
						}}
					/>
					<button
						type="button"
						class="block xl:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
						on:click={() => {
							$app.side = $app.side === "right" ? null : "right"
							$app = $app
						}}
					/>
				</div>
			</div>
		</header>

		<div class="relative z-0 mx-auto flex w-full max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
			<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent to-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)]" class:hidden={$app.side !== "left"}>
				<form
					action="/$/db"
					method="POST"
					class="flex flex-col items-start justify-start w-full p-5"
					use:enhance={async ({ form, data, cancel }) => {
						let name = data.get("agentName").endsWith(".gpt") ? data.get("agentName") : data.get("agentName") + ".gpt"
						console.log($page.data.user.username, name)
						if (name.split(".").length !== 2) {
							cancel()
						}
						data.set("path", $page.data.user.username)
						data.set("code", "touch " + data.get("agentName"))
						data.set("file", JSON.stringify({}))
						data.set("data", JSON.stringify({}))
						data.set("load", true)
						return async ({ result }) => {
							if (result.status === 200) {
								await invalidateAll()
								console.log(result)
								form.reset()
							} else {
								console.log(result)
							}
						}
					}}
				>
					<label for="agentName" class="sr-only">Agents</label>
					<div class="w-full flex flex-row items-center justify-center bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] rounded-sm shadow shadow-black/50">
						<input id="agentName" name="agentName" type="text" autocomplete="off" class="w-full h-10 px-2.5 rounded-l-sm focus:outline-none bg-transparent border-r border-r-[hsl(240DEG,6%,9%)]" />
						<button type="submit" class="flex items-center justify-center h-10 px-2.5 rounded-r-sm whitespace-nowrap focus:outline-none select-none">create</button>
					</div>
				</form>
				<ul class="grid grid-cols-1 gap-2.5 px-5 pb-5">
					{#if $lib.host && $page.data.user?.data}
						{#each Object.keys($page.data.user.data)
							.map((item) => {
								return { name: item, contents: data.user.data[item]?.file?.contents || data.user.data[item]?.directory, kind: [Object.keys(data.user.data[item]).join("")].includes("directory") ? "directory" : "file" }
							})
							.filter((item) => item.name.endsWith(".gpt")) as item (item.name)}
							{@const { controls, messages } = item?.contents?.length ? JSON.parse(item.contents) : {}}
							<li class="flex flex-row items-center justify-start w-full h-10 col-span-1 gap-2">
								<div class="flex items-center justify-center h-full aspect-[1/1] rounded-sm cursor-grab bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
									{#if controls?.imageURL?.length}
										<img alt={item.kind} src="data:image/png;base64,{controls.imageURL}" class="pointer-events-none object-cover rounded-sm" />
									{/if}
								</div>
								<button
									type="button"
									on:click={() => {
										$app.agent = null
										$app = $app
										queueMicrotask(() => {
											if (item.contents?.length) {
												let { messages, controls } = JSON.parse(item.contents)
												$app.agent = { name: item.name, contents: item.contents, messages, controls }
											} else {
												$app.agent = { name: item.name, contents: "", messages: [], controls: {} }
											}
											$app = $app
										})
									}}
									class="w-full h-full p-0.5 pl-2.5 text-left line-clamp-1 focus:outline-none select-none rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
								>
									{item.name.slice(0, -4)}
								</button>
							</li>
						{/each}
					{/if}
				</ul>
			</aside>

			<main id="feed" class="z-0 relative flex flex-col flex-1">
				<ul id="list" bind:this={$app.feed} class="flex flex-col items-start justify-end w-full h-full min-h-[calc(100vh-11rem-4rem)] pb-6 lg:px-3 xl:bg-gradient-to-tl xl:from-[hsl(240DEG,6%,6%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-transparent">
					{#each $app.agent ? $app.agent.messages : $app.messages as message (message.id)}
						{#if message.role === "assistant"}
							<li class="flex flex-row items-start justify-start pr-16">
								<div class="w-12 h-12 m-4 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50">
									{#if $app.agent?.controls?.imageURL}
										<img id="image" src="data:image/png;base64,{$app.agent.controls.imageURL}" class="w-full h-full object-cover rounded-sm" alt="Dall-e Generated Mask" />
									{/if}
								</div>
								<div class="whitespace-pre-wrap text-sm flex flex-col items-start justify-start pt-3 pr-4">
									<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-2"><!--{@html mark(message.content)}-->{message.content}</div>
								</div>
							</li>
						{:else}
							<li class="flex flex-row items-start justify-start ml-auto pl-20">
								<div class="whitespace-pre-wrap text-sm flex flex-col items-end justify-end pt-3 pr-4">
									<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-2"><!--{@html mark(message.content)}-->{message.content}</div>
								</div>
								<div class="w-12 h-12 m-4 ml-0 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50" />
							</li>
						{/if}
					{/each}
				</ul>
				<form action="/$/ai/gpt-4" method="POST" on:submit|preventDefault={send} class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-44 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] sm:bg-transparent xl:bg-gradient-to-t xl:from-[hsla(240DEG,6%,6%,90%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
					<div class="flex flex-row w-full h-full sm:px-4 md:pr-0 lg:pl-7 xl:pl-7 py-8">
						<label for="editor" class="w-full h-full flex flex-row items-center justify-center">
							<span class="sr-only">prompt</span>
							<textarea
								id="editor"
								type="text"
								name="editor"
								autocomplete="off"
								class="w-full h-full resize-none px-3 py-2.5 focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 rounded-sm"
								bind:this={$app.textarea}
								on:keydown={async (e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault()
										await send(e)
									}
								}}
							/>
						</label>
						<div class="flex flex-row items-center justify-center h-full sm:aspect-[1/1] flex-1 ml-auto px-4 whitespace-nowrap">
							<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
								<img alt="send" src={_send} class="block w-5 h-auto" />
							</button>
						</div>
					</div>
				</form>
			</main>

			<aside class="w-screen sm:w-96 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-l from-transparent via-transparent via-60% to-[hsl(240DEG,6%,6%)] border-l border-l-[hsl(240DEG,6%,9%)]" class:hidden={$app.side !== "right"}>
				{#if $app.agent}
					<Mask contents={$app.agent.contents} path={data.user.username + "/" + $app.agent.name} />
				{:else}
					<Anon />
				{/if}
			</aside>
		</div>
	</div>

	{#if $lib.open}
		<Open />
	{/if}
{/if}
