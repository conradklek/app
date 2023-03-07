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

	$: opened = false
	$: search = ""
	$: prompt = ""
	$: memory = []

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
				prompt,
				memory
			}),
			headers: {
				"content-type": "application/json"
			}
		})
		const data = await response.json()
		console.log(data)
		if (data.error || !data.choices) return (prompt = "")
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
			default: {
				$webcontainer.terminal.input.write(code + "\r")
				break
			}
		}
		search = ""
		$webcontainer = $webcontainer
	}
	onMount(async () => {
		memory = (await localforage.getItem("memory")) || []
	})
	$: {
		if ($webcontainer?.terminal?.stream) {
			console.log($webcontainer.terminal?.stream?.replace(ansiRegex(), "").split("❯ ").slice(-2).join("") + search)
		}
	}
</script>

<header />

<nav />

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
						{@const type = Object.keys(item).includes("file") ? "file" : "directory"}
						<li class={type}>
							<span>
								{#if path.slice(1) === $page.data.path}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 18.25V7.75c0-1.105.918-2 2.05-2h1.368c.531 0 1.042.201 1.424.561l.932.878c.382.36.892.561 1.424.561h5.302a1 1 0 0 1 1 1v3m-13.5 6.5h12.812l1.642-5.206c.2-.635-.278-1.278-.954-1.294m-13.5 6.5 1.827-5.794c.133-.42.53-.706.98-.706H18.25" />
									</svg>
								{:else if type === "file"}
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M12.75 4.75H7.75C6.64543 4.75 5.75 5.64543 5.75 6.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V10.25M12.75 4.75V8.25C12.75 9.35457 13.6454 10.25 14.75 10.25H18.25M12.75 4.75L18.25 10.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
										<path d="M8.75 15.75H15.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
										<path d="M8.75 12.75H11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								{:else}
									<svg width="20" height="20" fill="none" viewBox="0 0 24 24">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.25 17.25V9.75C19.25 8.64543 18.3546 7.75 17.25 7.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25Z" />
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 7.5L12.5685 5.7923C12.2181 5.14977 11.5446 4.75 10.8127 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V11" />
									</svg>
								{/if}
							</span>
							<a href="/${path.slice(1) === $page.data.path ? path.split('/').slice(0, -1).join('/') : path}" class:active={path.slice(1) === $page.data.path}>
								{path.slice(1) === $page.data.path ? "../" : ""}{path.split("/").pop()}
							</a>
						</li>
					{/each}
				</ul>
			{:else if Object.keys(item[1]).includes("file")}
				{#if $webcontainer.host}
					<Code file={item[1].file} code={$codemirror} tabs={true} wrap={true} type={$page.data.path.split(".").pop()} on:update={async (e) => await $webcontainer.fs.writeFile($page.data.path, e.detail)} />
				{:else}
					{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
						<Code {file} code={$codemirror} tabs={true} wrap={true} type={$page.data.path.split(".").pop()} on:update={async (e) => await $webcontainer.fs.writeFile($page.data.path, e.detail)} />
					{/await}
				{/if}
			{/if}
		{/await}
	{/if}
</main>

<aside />

<footer>
	<div>
		<a href="/${$page.data.path?.length ? '/' + $page.data.path.split('/').slice(0, -1).join('/') : ''}">
			{#if $page.data.path?.length}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M11.25 8.75L7.75 12L11.25 15.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M16.25 8.75L12.75 12L16.25 15.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{:else}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M5.75 11V18.6671C5.75 19.1739 6.35441 19.4368 6.72519 19.0913L7.43088 18.4337C8.06762 17.8404 9.0151 17.7272 9.77366 18.1539L11.5097 19.1305C11.8142 19.3017 12.1858 19.3017 12.4903 19.1305L14.2263 18.1539C14.9849 17.7272 15.9324 17.8404 16.5691 18.4337L17.2748 19.0913C17.6456 19.4368 18.25 19.1739 18.25 18.6671V11C18.25 7.54822 15.4518 4.75 12 4.75C8.54822 4.75 5.75 7.54822 5.75 11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M10.5 10C10.5 10.2761 10.2761 10.5 10 10.5C9.72386 10.5 9.5 10.2761 9.5 10C9.5 9.72386 9.72386 9.5 10 9.5C10.2761 9.5 10.5 9.72386 10.5 10Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M14.5 10C14.5 10.2761 14.2761 10.5 14 10.5C13.7239 10.5 13.5 10.2761 13.5 10C13.5 9.72386 13.7239 9.5 14 9.5C14.2761 9.5 14.5 9.72386 14.5 10Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{/if}
		</a>
	</div>
	<nav>
		{#if $webcontainer?.terminal}
			<Code
				mini={true}
				on:submit={(e) => sudo(e.detail)}
				on:update={(e) => (search = e.detail)}
				on:up={() => {
					$webcontainer.terminal.input.write("\x1b[A")
				}}
				on:down={() => {
					$webcontainer.terminal.input.write("\x1b[B")
				}}
			/>
		{/if}
	</nav>
</footer>

<nav>
	<button
		type="button"
		on:click={() => {
			dialog.showModal()
			opened = true
		}}
	>
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18.25C15.5 18.25 19.25 16.5 19.25 12C19.25 7.5 15.5 5.75 12 5.75C8.5 5.75 4.75 7.5 4.75 12C4.75 13.0298 4.94639 13.9156 5.29123 14.6693C5.50618 15.1392 5.62675 15.6573 5.53154 16.1651L5.26934 17.5635C5.13974 18.2547 5.74527 18.8603 6.43651 18.7307L9.64388 18.1293C9.896 18.082 10.1545 18.0861 10.4078 18.1263C10.935 18.2099 11.4704 18.25 12 18.25Z" />
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z" />
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12Z" />
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M15.5 12C15.5 12.2761 15.2761 12.5 15 12.5C14.7239 12.5 14.5 12.2761 14.5 12C14.5 11.7239 14.7239 11.5 15 11.5C15.2761 11.5 15.5 11.7239 15.5 12Z" />
		</svg>
	</button>
</nav>

<dialog bind:this={dialog}>
	<form method="dialog" on:submit={send}>
		{#if opened && !reset}
			<Code file={prompt} code={editor} wrap={true} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit">
			{#if prompt.trim().length > 0}
				<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 19.25L12 4.75L19.25 19.25L12 15.75L4.75 19.25Z" />
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15.5V12.75" />
				</svg>
			{:else}
				<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 6.75L6.75 17.25" />
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 6.75L17.25 17.25" />
				</svg>
			{/if}
		</button>
	</form>
	<ul>
		{#each memory as message (message.uuid)}
			<li class={message.role}>
				{@html mark(message.content)}
			</li>
		{/each}
	</ul>
</dialog>

<slot />
