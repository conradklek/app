<script>
	import { _caret, _chat, _command, _file, _folder, _send } from "$lib/assets/svg"
	import { load_directory, read, flat, library } from "$lib/stores/library"
	import { Nested, Mirror, Terminal, Window } from "$lib/components"
	import { onMount } from "svelte"
	import Markdoc from "@markdoc/markdoc"
	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	$: form = null
	$: scroller = null
	$: messages = []
	function scroll_down() {
		queueMicrotask(() => {
			scroller.scrollTo({
				top: scroller.scrollHeight,
				behavior: "smooth"
			})
		})
	}
	onMount(async () => {
		if (!$library.wc) {
			const { WebContainer } = await import("@webcontainer/api")
			$library.wc = await WebContainer.boot()
			await $library.wc.mount({})
			$library.wc.on("server-ready", (_, url) => {
				$library.host = url
			})
		}
	})
	async function list(wc, path, obj = {}) {
		try {
			const dir = await wc.fs.readdir(path, { withFileTypes: true })
			for (const item of dir) {
				if (item.name === "node_modules" || item.name.startsWith(".") || item.name === "pnpm-lock.yaml") continue
				if (item.isDirectory()) {
					obj[item.name] = { directory: await list(wc, `${path}/${item.name}`) }
				} else if (item.isFile()) {
					obj[item.name] = {
						file: {
							contents: await wc.fs.readFile(`${path}/${item.name}`, "utf8")
						}
					}
				}
			}
		} catch (error) {
			console.log(error)
		}
		return obj
	}
</script>

<div class="relative h-screen flex flex-col items-center justify-center overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]">
	{#if $library.host}
		<Window host={$library.host} />
	{/if}
	<header class="z-50 sticky top-0 left-0 w-full shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<a href="/ai" class="grid place-items-center h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 select-none whitespace-nowrap">
				<span class="sr-only">AI Home</span>
				<span class="text-xl select-none">🦾</span>
			</a>
			<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-1.5 select-none whitespace-nowrap">
				{#if $library.open}
					{#each $library.open.split("/").filter(Boolean) as path}
						<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
							<img alt="caret" src={_caret} class="block w-2 h-auto" />
						</div>
						<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 text-sm tracking-wide whitespace-nowrap">{path}</div>
					{/each}
				{:else}
					<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
						<img alt="caret" src={_caret} class="block w-2 h-auto" />
					</div>
					<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 tracking-wide whitespace-nowrap">DEV</div>
				{/if}
			</nav>
		</div>
	</header>
	<div class="relative z-0 mx-auto flex w-screen max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
		<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)] xl:border-l xl:border-l-[hsl(240DEG,6%,9%)]">
			<div class="grid grid-cols-1 w-full p-4">
				{#if $library.wc}
					{#await list($library.wc, "") then data}
						<Nested {data} />
					{/await}
				{/if}
			</div>
		</aside>
		<main class="z-0 sticky top-16 flex flex-col flex-1 shrink-0 h-[calc(100vh-4rem)] overflow-auto">
			<div>
				<div class="w-full h-[calc(100vh-15rem)]">
					{#if $library.open !== null}
						{@const type = $library.open.split(".").at(-1)}
						{#if ["md", "js", "html", "css", "json", "svelte"].includes(type)}
							{#await read($library.wc, $library.open.split("/").slice(0, -1).join("/")) then directory}
								{@const file = directory[$library.open.split("/").at(-1)].file.contents}
								<Mirror
									{file}
									{type}
									on:update={async (e) => {
										await $library.wc.fs.writeFile($library.open, e.detail)
									}}
								/>
							{/await}
						{/if}
					{/if}
				</div>
				<div class="z-30 sticky bottom-0 right-0 w-full h-56 mt-auto px-3 pt-1.5 border-t border-t-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50">
					{#if $library.wc && !$library.host}
						<Terminal
							webcontainerInstance={$library.wc}
							on:update={() => {
								setTimeout(() => {
									$library.wc = $library.wc
								}, 100)
							}}
						/>
					{:else if $library.host}
						<Terminal
							webcontainerInstance={$library.wc}
							on:update={() => {
								setTimeout(() => {
									$library.wc = $library.wc
								}, 100)
							}}
						/>
					{/if}
				</div>
			</div>
		</main>
		<aside class="w-screen sm:w-96 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:flex flex-col items-start justify-end overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] border-l border-l-[hsl(240DEG,6%,9%)] xl:border-r xl:border-r-[hsl(240DEG,6%,9%)]" bind:this={scroller}>
			<ul class="flex flex-col items-start justify-end w-full h-full pb-6 lg:px-3 overflow-auto">
				{#each messages as message (message.id)}
					<li class="flex flex-row items-start justify-start">
						<div class="text-sm flex flex-col items-end justify-end pt-2.5 pr-4">
							<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm [&_pre]:max-w-sm [&_pre]:overflow-x-auto">{@html mark("```\n" + message.content + "\n```")}</div>
						</div>
					</li>
				{/each}
			</ul>
			<form
				action="/ai/dev"
				method="POST"
				class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-56 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)]"
				bind:this={form}
				on:submit|preventDefault={async (e) => {
					const data = new FormData(e.target)
					const prompt = data.get("prompt")
					const action = form.action
					const method = form.method
					form.reset()
					messages = []
					messages.push({
						role: "user",
						content: prompt,
						id: crypto.randomUUID()
					})
					messages = messages
					const response = await fetch(action, {
						method,
						body: JSON.stringify({ prompt }),
						headers: {
							"Content-Type": "application/json"
						}
					})
					let reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
					let message = {
						role: "assistant",
						content: "",
						id: crypto.randomUUID()
					}
					messages.push(message)
					messages = messages
					let stream = ""
					while (true) {
						let { done, value } = await reader.read()
						if (value) {
							message.content += value
							messages = messages
							scroll_down()
							stream += value
							try {
								let { thoughts, command } = JSON.parse(stream)
								console.log({ thoughts, command })
								if (command?.name === "write_file") {
									const { file_path, text } = command.args
									await $library.wc.fs.writeFile(file_path, text)
									$library.wc = $library.wc
								}
								stream = ""
							} catch (error) {}
						}
						if (done) {
							break
						}
					}
					form.prompt.focus()
				}}
			>
				<div class="flex flex-col items-center gap-2 w-full h-56 p-4">
					<label for="prompt" class="w-full h-full flex flex-row items-center justify-center">
						<span class="sr-only">prompt</span>
						<textarea
							id="prompt"
							type="text"
							name="prompt"
							autocomplete="off"
							class="w-full h-full resize-none px-3 py-2.5 focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 rounded-sm"
							on:keydown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault()
									form.submit()
								}
							}}
						/>
					</label>
					<div class="flex flex-row items-center justify-center w-full whitespace-nowrap">
						<button type="submit" class="flex items-center justify-center w-full h-10 rounded-sm whitespace-nowrap focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
							<img alt="send" src={_send} class="block w-5 h-auto" />
						</button>
					</div>
				</div>
			</form>
		</aside>
	</div>
</div>
