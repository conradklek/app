<script>
	import { page } from "$app/stores"
	import localforage from "localforage"
	import Markdoc from "@markdoc/markdoc"
	import { Code } from "$lib/client/components"
	import { codemirror } from "$lib/client/stores/codemirror"
	import { webcontainer, read, flat, load } from "$lib/client/stores/webcontainer"
	import { onMount } from "svelte"
	import ansiRegex from "ansi-regex"

	let dialog
	let editor

	$: toggle = false
	$: opened = false
	$: search = ""
	$: prompt = ""
	$: memory = []
	$: embeds = {}

	$: reset = false
	$: loading = false

	function arrows(e) {
		if (!e.target.matches("a")) return
		let next
		switch (e.key) {
			case "ArrowRight":
				next = e.target.parentNode.nextElementSibling
				break
			case "ArrowLeft":
				next = e.target.parentNode.previousElementSibling
				break
			case "ArrowDown":
				next = e.target.parentNode.nextElementSibling?.nextElementSibling
				break
			case "ArrowUp":
				next = e.target.parentNode.previousElementSibling?.previousElementSibling
				break
			default: {
				break
			}
		}
		if (next) next.querySelector("a").focus()
	}

	async function chat() {
		if (!prompt.trim().length) return (prompt = "")
		if (loading) return
		loading = true
		let document = $codemirror?.viewState?.state?.doc?.toString() || null
		const response = await fetch("/$", {
			method: "POST",
			body: JSON.stringify({
				document,
				embeds,
				prompt,
				memory
			}),
			headers: {
				"content-type": "application/json"
			}
		})
		const data = await response.json()
		console.log(data)
		const message = { role: "assistant", content: data.choices[0].message.content, uuid: crypto.randomUUID(), date: new Date() }
		memory.push(message)
		memory = memory
		return (loading = false)
	}

	async function send(e) {
		if (!prompt.trim().length) return (prompt = "")
		e.preventDefault()
		memory.push({ role: "user", content: prompt, uuid: crypto.randomUUID(), date: new Date() })
		memory = memory
		reset = true
		await chat()
		prompt = ""
		await localforage.setItem("memory", memory)
		queueMicrotask(() => (reset = false))
	}

	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}

	async function sudo(code) {
		let [command, ...args] = code.trim().split(" ")
		switch (command) {
			case "read": {
				const data = await read($webcontainer, args[0])
				console.log(data)
				break
			}
			case "clear": {
				console.clear()
				memory = []
				await localforage.setItem("memory", memory)
				$webcontainer.terminal.stream = ""
				await localforage.setItem("terminal", $webcontainer.terminal.stream)
				break
			}
			case "kill": {
				await localforage.clear()
				window.location.reload()
				break
			}
			case "save": {
				const data = await read($webcontainer, "/")
				await localforage.setItem("indexedDB", data)
				console.log("saved", data)
				break
			}
			case "load": {
				const data = await load()
				const list = flat(data).filter(([, item]) => Object.keys(item).includes("file"))
				const dirs = new Set()
				for (const [path] of list) dirs.add(path.split("/").slice(0, -1).join("/"))
				for (const dir of dirs) await $webcontainer.fs.mkdir(dir, { recursive: true })
				for (const [path, item] of list) await $webcontainer.fs.writeFile(path, item.file)
				break
			}
			case "sync": {
				const response = await fetch("$", {
					method: "PATCH",
					body: JSON.stringify({
						data: flat(await read($webcontainer, "/"))
							.filter(([, item]) => Object.keys(item).includes("file"))
							.filter(([path]) => path.endsWith(".md"))
					}),
					headers: {
						"content-type": "application/json"
					}
				})
				const data = await response.json()
				console.log(data)
				await localforage.setItem("embeds", data)
				embeds = data
				break
			}
			default: {
				$webcontainer.terminal.input.write(code)
				break
			}
		}
		await localforage.setItem("terminal", $webcontainer.terminal.stream)
		$webcontainer = $webcontainer
	}
	onMount(async () => {
		memory = (await localforage.getItem("memory")) || []
		embeds = (await localforage.getItem("embeds")) || {}
	})
	$: {
		if ($webcontainer?.terminal?.stream) {
			console.clear()
			console.log($webcontainer.terminal?.stream?.replace(ansiRegex(), "").split("\n").slice(-100).join("\n") + search)
			console.table(memory)
			if ($codemirror) console.log($codemirror)
		}
	}
</script>

<header>
	<div>
		<a href="/$/{$page.data.path?.length ? $page.data.path.split('/').slice(0, -1).join('/') : ''}">
			{@html $page.data.path?.length ? "&larr;" : "&bull;"}
		</a>
	</div>
	<nav>
		{#if $webcontainer?.terminal}
			<Code on:submit={(e) => sudo(e.detail)} on:update={(e) => (search = e.detail)} on:up={() => console.log("up")} on:down={() => console.log("down")} mini={true} />
		{/if}
	</nav>
</header>

<nav>
	<button
		type="button"
		on:click={() => {
			dialog.showModal()
			opened = true
		}}
	/>
</nav>

<main>
	{#if $webcontainer?.terminal}
		{#await read($webcontainer, "/") then items}
			{@const item = flat(items).find(([item]) => item.slice(1) === $page.data.path) || ["/", { directory: true }]}
			{#if Object.keys(item[1]).includes("directory")}
				{@const list = $page.data.path?.length
					? [item].concat(
							flat(items)
								.filter(([, item]) => item.directory)
								.concat(flat(items).filter(([, item]) => !item.directory))
								.filter(([path]) => path.slice(1).startsWith($page.data.path + "/") && path.slice(1).split("/").length === $page.data.path.split("/").length + 1)
								.filter(([path]) => path.slice(1) !== $page.data.path)
					  )
					: flat(items)
							.filter(([, item]) => item.directory)
							.concat(flat(items).filter(([, item]) => !item.directory))
							.filter(([path]) => path.slice(1).split("/").length === 1)}
				<ul on:keydown={arrows}>
					{#each list as [path, item] (path)}
						<li class={Object.keys(item).includes("file") ? "file" : "directory"}>
							<a href="/${path.slice(1) === $page.data.path ? path.split('/').slice(0, -1).join('/') : path}" class:active={path.slice(1) === $page.data.path}>
								{@html path.slice(1) === $page.data.path ? "../" : path.split("/").pop()}
							</a>
						</li>
					{/each}
				</ul>
			{:else if Object.keys(item[1]).includes("file")}
				{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
					<Code {file} bind:code={$codemirror} tabs={true} hint={true} type={$page.data.path.split(".").pop()} on:update={async (e) => await $webcontainer.fs.writeFile($page.data.path, e.detail)} />
				{/await}
			{/if}
		{/await}
	{/if}
</main>

<aside class:toggle>
	{#if $webcontainer?.host}
		<iframe title="app" src={$webcontainer.host} />
	{/if}
</aside>

<footer />

<dialog bind:this={dialog}>
	<form method="dialog" on:submit={send}>
		{#if opened && !reset}
			<Code file={prompt} code={editor} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit" />
	</form>
	<ul>
		{#each memory as message (message.uuid)}
			<li class={message.role}>
				{@html mark(message.content)}
			</li>
		{/each}
	</ul>
</dialog>

<nav class:toggle>
	{#if $webcontainer?.host}
		<button type="button" on:click={() => (toggle = !toggle)} disabled={!$webcontainer.host} />
	{/if}
</nav>

<slot />
