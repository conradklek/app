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

<header>
	<div>
		<a href="/{$page.data.path?.length ? '$/' + $page.data.path.split('/').slice(0, -1).join('/') : ''}">
			{#if $page.data.path?.length}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6.74992 5L3.10348 8.64645C2.90822 8.84171 2.90822 9.15829 3.10348 9.35355L6.74992 13M3.99992 9H18.9999C20.1045 9 20.9999 9.89543 20.9999 11V16C20.9999 17.1046 20.1045 18 18.9999 18H11.9999" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{:else}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M14.3966 7.29289C14.006 6.90237 13.3729 6.90237 12.9823 7.29289L9.51268 10.7626C8.82926 11.446 8.82926 12.554 9.51268 13.2374L12.9823 16.7071C13.3729 17.0976 14.006 17.0976 14.3966 16.7071C14.7871 16.3166 14.7871 15.6834 14.3966 15.2929L11.1037 12L14.3966 8.70711C14.7871 8.31658 14.7871 7.68342 14.3966 7.29289Z" fill="currentColor" />
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
</header>

<nav>
	<button
		type="button"
		on:click={() => {
			dialog.showModal()
			opened = true
		}}
	>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M20.002 3C21.1065 3 22.002 3.89543 22.002 5V13C22.002 14.1046 21.1065 15 20.002 15H18.002V17C18.002 18.1046 17.1065 19 16.002 19H10.7611L6.4876 21.3742C6.17787 21.5462 5.8002 21.5416 5.49483 21.3619C5.18945 21.1822 5.00195 20.8543 5.00195 20.5V19H4.00195C2.89738 19 2.00195 18.1046 2.00195 17V9C2.00195 7.89543 2.89738 7 4.00195 7H6.00195V5C6.00195 3.89543 6.89738 3 8.00195 3H20.002ZM8.00195 7H16.002C17.1065 7 18.002 7.89543 18.002 9V13H20.002V5L8.00195 5V7Z" fill="currentColor" />
		</svg>
	</button>
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
						{@const type = Object.keys(item).includes("file") ? "file" : "directory"}
						<li class={type}>
							<span>
								{#if path.slice(1) === $page.data.path}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M5 3C3.34315 3 2 4.34315 2 6V17.5592C2 18.9072 3.09277 20 4.44076 20H18.0296C18.0345 20 18.0401 20 18.045 20C18.0636 19.9999 18.0821 19.9996 18.1006 19.9992C19.3837 19.9693 20.5093 19.1248 20.8937 17.8948L22.5494 12.5965C22.9151 11.4264 22.1542 10.2391 21 10.0318V9C21 7.34315 19.6569 6 18 6H12.5352L11.4258 4.3359C10.8694 3.5013 9.93269 3 8.92963 3H5ZM19 10V9C19 8.44772 18.5523 8 18 8H12.5352C11.8665 8 11.242 7.6658 10.8711 7.1094L9.76168 5.4453C9.57622 5.1671 9.26399 5 8.92963 5H5C4.44772 5 4 5.44772 4 6V17.5592C4 17.8027 4.19734 18 4.44076 18C4.63355 18 4.80396 17.8747 4.86146 17.6907L6.60694 12.1052C6.99833 10.8527 8.15823 10 9.47038 10H19Z" fill="currentColor" />
									</svg>
								{:else if type === "file"}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2H5.75C4.7835 2 4 2.7835 4 3.75V20.25C4 21.2165 4.7835 22 5.75 22H18.25C19.2165 22 20 21.2165 20 20.25V10H13.75C12.7835 10 12 9.2165 12 8.25V2ZM8 14.25C8 13.8358 8.33579 13.5 8.75 13.5H12.25C12.6642 13.5 13 13.8358 13 14.25C13 14.6642 12.6642 15 12.25 15H8.75C8.33579 15 8 14.6642 8 14.25ZM8.75 17.5C8.33579 17.5 8 17.8358 8 18.25C8 18.6642 8.33579 19 8.75 19H15.25C15.6642 19 16 18.6642 16 18.25C16 17.8358 15.6642 17.5 15.25 17.5H8.75Z" fill="currentColor" />
										<path d="M19.5566 8.5C19.5343 8.475 19.5112 8.45058 19.4874 8.42678L13.5732 2.51256C13.5494 2.48876 13.525 2.46571 13.5 2.44343V8.25C13.5 8.38807 13.6119 8.5 13.75 8.5H19.5566Z" fill="currentColor" />
									</svg>
								{:else}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M3.75 3C2.7835 3 2 3.7835 2 4.75V18.25C2 19.2165 2.7835 20 3.75 20H20.25C21.2165 20 22 19.2165 22 18.25V7.75C22 6.7835 21.2165 6 20.25 6H12.5352C12.4516 6 12.3735 5.95822 12.3272 5.88867L10.9209 3.77927C10.5963 3.29243 10.0499 3 9.46482 3H3.75Z" fill="currentColor" />
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
	{#if $page.data.path?.length}
		<ol>
			{#each $page.data.path.split("/") as path, i}
				<li>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L14.1768 10.7626C14.8602 11.446 14.8602 12.554 14.1768 13.2374L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.5858 12L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z" fill="currentColor" />
					</svg>
					<a
						href="/$/{$page.data.path
							.split('/')
							.slice(0, i + 1)
							.join('/')}"
					>
						{path}
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</footer>

<dialog bind:this={dialog}>
	<form method="dialog" on:submit={send}>
		{#if opened && !reset}
			<Code file={prompt} code={editor} wrap={true} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit">
			{#if prompt.trim().length > 0}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2.86263 4.87565C2.49397 3.6222 3.79271 2.52938 4.96469 3.10688L20.2822 10.6547C21.3982 11.2046 21.3982 12.7958 20.2822 13.3457L4.96469 20.8935C3.7927 21.471 2.49397 20.3781 2.86263 19.1247L4.66402 13H9.00044C9.55272 13 10.0004 12.5523 10.0004 12C10.0004 11.4477 9.55272 11 9.00044 11H4.66391L2.86263 4.87565Z" fill="currentColor" />
				</svg>
			{:else}
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.7071 9.70711C16.0976 9.31658 16.0976 8.68342 15.7071 8.29289C15.3166 7.90237 14.6834 7.90237 14.2929 8.29289L15.7071 9.70711ZM8.29289 14.2929C7.90237 14.6834 7.90237 15.3166 8.29289 15.7071C8.68342 16.0976 9.31658 16.0976 9.70711 15.7071L8.29289 14.2929ZM14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L14.2929 15.7071ZM9.70711 8.29289C9.31658 7.90237 8.68342 7.90237 8.29289 8.29289C7.90237 8.68342 7.90237 9.31658 8.29289 9.70711L9.70711 8.29289ZM14.2929 8.29289L8.29289 14.2929L9.70711 15.7071L15.7071 9.70711L14.2929 8.29289ZM15.7071 14.2929L9.70711 8.29289L8.29289 9.70711L14.2929 15.7071L15.7071 14.2929Z" fill="black" />
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
