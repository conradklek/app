<!-- BLANK -->

<!--
<script>
	import { onMount } from "svelte"
	import localforage from "localforage"
	import Markdoc from "@markdoc/markdoc"
	import { Editor } from "$lib/client/components"
	import { codemirror } from "$lib/client/stores/codemirror"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import { WebContainer } from "@webcontainer/api"

	export let data

	$: files = null

	async function save() {
		const data = await read("/")
		await localforage.setItem("indexedDB", data)
		console.log("saved", files)
	}
	async function read(path) {
		const obj = {}
		const dir = await $webcontainer.fs.readdir(path, { withFileTypes: true })
		for (const item of dir) {
			if (
				item.name === "node_modules" ||
				item.name.startsWith(".") ||
				item.name === "pnpm-lock.yaml"
			)
				continue
			if (item.isDirectory()) {
				obj[item.name] = { directory: await read(`${path}/${item.name}`) }
			} else if (item.isFile()) {
				obj[item.name] = {
					file: {
						contents: await $webcontainer.fs.readFile(`${path}/${item.name}`, "utf8")
					}
				}
			}
		}
		if (path === "/") {
			files = obj
		}
		return obj
	}
	function flat(tree, path = "", data = []) {
		for (const [name, item] of Object.entries(tree)) {
			if (item.directory) {
				flat(item.directory, `${path}/${name}`, data)
			} else if (item.file) {
				data.push(`${path}/${name}`)
			}
		}
		return data
	}
	async function pipe(stream) {
		const process = await stream
		process.output.pipeTo(
			new WritableStream({
				write(data) {
					console.log(data)
				}
			})
		)
		return process.exit
	}
	async function load(handler, path = "", data = {}) {
		if (!handler) {
			handler = await window.showDirectoryPicker()
			return await load(handler, "", {})
		}
		for await (const entry of handler.values()) {
			if (entry.kind === "directory") {
				data[entry.name] = {
					directory: await load(entry, `${path}/${entry.name}`, {})
				}
			} else if (entry.kind === "file") {
				const text = await entry.getFile().then((file) => file.text())
				data[entry.name] = {
					file: {
						contents: text
					}
				}
			}
		}
		return data
	}
	let dialog
	let editor
	let iframe

	$: toggle = false
	$: opened = false
	$: search = ""
	$: prompt = ""
	$: memory = []
	$: embeds = {}

	$: error = ""
	$: reset = false
	$: loading = false
	$: endStream = false
	$: resetSearch = false

	async function sudo(code) {
		let [command, ...args] = code.slice(0, -1).split(" ").filter(Boolean)
		switch (command) {
			case "clear": {
				console.clear()
				break
			}
			case "kill": {
				await localforage.setItem("memory", [])
				memory = []
				break
			}
			case "read": {
				const data = await read("/")
				console.table(flat(data))
				break
			}
			case "save": {
				await save()
				break
			}
			case "load": {
				const data = await load()
				const list = flat(data)
					.filter(([path]) => !path.startsWith("/."))
					.filter(([path]) => !path.startsWith("/node_modules"))
				const dirs = new Set()
				for (const [path] of list) dirs.add(path.split("/").slice(0, -1).join("/"))
				for (const dir of dirs) await $webcontainer.fs.mkdir(dir, { recursive: true })
				for (const file of list) await $webcontainer.fs.writeFile(...file)
				break
			}
			case "sync": {
				await sync()
				break
			}
			default: {
				await pipe($webcontainer.spawn(command, args))
				files = await read("/")
				break
			}
		}
	}
	async function sync() {
		const response = await fetch("$", {
			method: "PATCH",
			body: JSON.stringify({
				data: flat(await read("/"))
			}),
			headers: {
				"content-type": "application/json"
			}
		})
		const data = await response.json()
		console.log(data)
		await localforage.setItem("embeds", data)
		embeds = data
	}
	async function chat() {
		if (loading) return
		endStream = false
		loading = true
		const message = { from: "ai", text: "", uuid: crypto.randomUUID(), date: new Date() }
		memory.push(message)
		memory = memory
		const response = await fetch("$", {
			method: "POST",
			body: JSON.stringify({
				embeds,
				prompt,
				memory: memory
					.map((item) => (item.from === "ai" ? `assistant:\n${item.text}` : `user:\n${item.text}`))
					.join("\n\n")
			}),
			headers: {
				"content-type": "application/json"
			}
		})
		if (response.ok) {
			try {
				const data = response.body
				if (!data) return
				const reader = data.getReader()
				const decoder = new TextDecoder()
				while (true) {
					const { value, done } = await reader.read()
					const chunkValue = decoder.decode(value)
					message.text += chunkValue
					memory = memory
					if (done) {
						endStream = true
						await localforage.setItem("memory", memory)
						break
					}
				}
			} catch (err) {
				error = "timeout"
			}
		} else {
			error = await response.text()
		}
		loading = false
	}

	async function send(e) {
		if (!prompt.trim().length) {
			return (prompt = "")
		}
		e.preventDefault()
		memory.push({ from: "human", text: prompt, uuid: crypto.randomUUID(), date: new Date() })
		memory = memory
		await chat()
		prompt = ""
		reset = true
		queueMicrotask(() => (reset = false))
	}

	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}

	onMount(async () => {
		try {
			$webcontainer = await WebContainer.boot()
			await $webcontainer.mount((await localforage.getItem("indexedDB")) || {})
			$webcontainer.on("server-ready", (port, url) => {
				console.log("server-ready", port, url)
				$webcontainer.host = url
			})
			$webcontainer.on("port", (event) => {
				console.log(event)
			})
		} catch (e) {
			console.log(e)
		}
		memory = (await localforage.getItem("memory")) || []
		embeds = (await localforage.getItem("embeds")) || {}
	})
</script>

<aside class:toggle>
	{#if $webcontainer?.host}
		<iframe title="app" src={$webcontainer.host} />
	{/if}
</aside>

<header>
	<div>
		<a
			href="/"
			on:click={() => {
				search = ""
				resetSearch = true
				queueMicrotask(() => (resetSearch = false))
			}}
			>&nbsp;
		</a>
	</div>
	<nav>
		{#if !resetSearch}
			<Editor on:update={(e) => (search = e.detail)} mini={true} />
		{/if}
	</nav>
	{#if search.trim().length}
		{#await read("/") then tree}
			{@const files = flat(tree)}
			<ul>
				{#each files as [path] (path)}
					{#if path.includes(search)}
						<li>
							<a
								href={path}
								on:click={() => {
									search = ""
									resetSearch = true
									queueMicrotask(() => (resetSearch = false))
								}}
							>
								{path}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/await}
	{/if}
</header>

<nav class:toggle>
	{#if $webcontainer?.host}
		<button type="button" on:click={() => (toggle = !toggle)} />
	{:else}
		<button type="button" disabled />
	{/if}
</nav>

<main>
	{#if $webcontainer}
		{#await read("/") then _}
			{@const list = flat(files)}
			{#if list.includes("/" + data.path)}
				{#await $webcontainer.fs.readFile(data.path, "utf8") then file}
					<Editor
						{file}
						code={$codemirror}
						tabs={true}
						type={data.path.split(".").pop()}
						on:update={async (e) => await $webcontainer.fs.writeFile(data.path, e.detail)}
					/>
				{/await}
			{:else}
				{#await $webcontainer.fs.readdir(data.path) then items}
					{#each items as item}
						<div>
							<a href="{data.path}/{item}">{item}</a>
						</div>
					{/each}
				{/await}
			{/if}
		{/await}
	{/if}
</main>

<footer />

<nav>
	<button
		type="button"
		on:click={() => {
			dialog.showModal()
			opened = true
		}}
	/>
</nav>

<dialog bind:this={dialog}>
	<form method="dialog" on:submit={send}>
		{#if opened && !reset}
			<Editor file={prompt} code={editor} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit" />
	</form>
	<ul>
		{#each memory as message (message.uuid)}
			<li class={message.from}>
				{@html mark(message.text)}
			</li>
		{/each}
	</ul>
</dialog>
-->
