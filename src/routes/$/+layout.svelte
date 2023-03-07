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
		if (data.error) return (prompt = "")
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
				$webcontainer.terminal.input.write(code + "\r")
				break
			}
		}
		search = ""
		$webcontainer = $webcontainer
	}
	onMount(async () => {
		memory = (await localforage.getItem("memory")) || []
		embeds = (await localforage.getItem("embeds")) || {}
	})
	$: {
		if ($webcontainer?.terminal?.stream) {
			console.clear()
			console.log($webcontainer.terminal?.stream?.replace(ansiRegex(), "").split("❯ ").slice(-2).join("") + search)
			console.table(memory)
			if ($codemirror) console.log($codemirror)
		}
	}
</script>

<header>
	<div>
		<a href="/$/{$page.data.path?.length ? $page.data.path.split('/').slice(0, -1).join('/') : ''}">
			{#if $page.data.path?.length}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
					><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
						d="M399.1 88v336c0 13.25 10.76 24 24.02 24S448 437.3 448 424V88C448 74.75 437.2 64 423.1 64S399.1 74.75 399.1 88zM176.3 366.5L84.28 280h243.6c13.26 0 24.05-10.75 24.05-24S341.2 232 327.9 232h-243.6l91.98-86.53C181.3 140.8 183.8 134.4 183.8 128c0-5.906-2.158-11.81-6.536-16.44C168.2 101.9 153 101.4 143.4 110.5l-136.1 128c-9.694 9.062-9.694 25.88 0 34.94l136.1 128c9.663 9.094 24.86 8.625 33.93-1.031C186.4 390.8 185.1 375.6 176.3 366.5z"
					/></svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
					><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
						d="M256 112c-48.6 0-88 39.4-88 88C168 248.6 207.4 288 256 288s88-39.4 88-88C344 151.4 304.6 112 256 112zM256 240c-22.06 0-40-17.95-40-40C216 177.9 233.9 160 256 160s40 17.94 40 40C296 222.1 278.1 240 256 240zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-46.73 0-89.76-15.68-124.5-41.79C148.8 389 182.4 368 220.2 368h71.69c37.75 0 71.31 21.01 88.68 54.21C345.8 448.3 302.7 464 256 464zM416.2 388.5C389.2 346.3 343.2 320 291.8 320H220.2c-51.36 0-97.35 26.25-124.4 68.48C65.96 352.5 48 306.3 48 256c0-114.7 93.31-208 208-208s208 93.31 208 208C464 306.3 446 352.5 416.2 388.5z"
					/></svg
				>
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
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
			><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
				d="M136.2 150.3L232.2 238.3C237.2 242.9 240 249.3 240 256C240 262.7 237.2 269.1 232.2 273.7L136.2 361.7C126.4 370.6 111.3 369.1 102.3 360.2C93.35 350.4 94.01 335.3 103.8 326.3L180.5 256L103.8 185.7C94.01 176.7 93.35 161.6 102.3 151.8C111.3 142 126.4 141.4 136.2 150.3V150.3zM392 336C405.3 336 416 346.7 416 360C416 373.3 405.3 384 392 384H248C234.7 384 224 373.3 224 360C224 346.7 234.7 336 248 336H392zM448 32C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H448zM448 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V96C464 87.16 456.8 80 448 80z"
			/></svg
		>
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
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
										><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
											d="M572.6 270.3l-96 192C471.2 473.2 460.1 480 447.1 480H64c-35.35 0-64-28.66-64-64V96c0-35.34 28.65-64 64-64h117.5c16.97 0 33.25 6.742 45.26 18.75L275.9 96H416c35.35 0 64 28.66 64 64v32h-48V160c0-8.824-7.178-16-16-16H256L192.8 84.69C189.8 81.66 185.8 80 181.5 80H64C55.18 80 48 87.18 48 96v288l71.16-142.3C124.6 230.8 135.7 224 147.8 224h396.2C567.7 224 583.2 249 572.6 270.3z"
										/></svg
									>
								{:else if type === "file"}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
										><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
											d="M0 64C0 28.65 28.65 0 64 0H229.5C246.5 0 262.7 6.743 274.7 18.75L365.3 109.3C377.3 121.3 384 137.5 384 154.5V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V64zM336 448V160H256C238.3 160 224 145.7 224 128V48H64C55.16 48 48 55.16 48 64V448C48 456.8 55.16 464 64 464H320C328.8 464 336 456.8 336 448z"
										/></svg
									>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
										><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
											d="M447.1 96h-172.1L226.7 50.75C214.7 38.74 198.5 32 181.5 32H63.1c-35.35 0-64 28.66-64 64v320c0 35.34 28.65 64 64 64h384c35.35 0 64-28.66 64-64V160C511.1 124.7 483.3 96 447.1 96zM463.1 416c0 8.824-7.178 16-16 16h-384c-8.822 0-16-7.176-16-16V96c0-8.824 7.178-16 16-16h117.5c4.273 0 8.293 1.664 11.31 4.688L255.1 144h192c8.822 0 16 7.176 16 16V416z"
										/></svg
									>
								{/if}
							</span>
							<a href="/${path.slice(1) === $page.data.path ? path.split('/').slice(0, -1).join('/') : path}" class:active={path.slice(1) === $page.data.path}>
								{@html path.slice(1) === $page.data.path ? "../" : path.split("/").pop()}
							</a>
						</li>
					{/each}
				</ul>
			{:else if Object.keys(item[1]).includes("file")}
				{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
					<Code {file} code={$codemirror} tabs={true} type={$page.data.path.split(".").pop()} on:update={async (e) => await $webcontainer.fs.writeFile($page.data.path, e.detail)} />
				{/await}
			{/if}
		{/await}
	{/if}
</main>

<aside />

<footer />

<nav />

<dialog bind:this={dialog}>
	<form method="dialog" on:submit={send}>
		{#if opened && !reset}
			<Code file={prompt} code={editor} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit">
			{#if prompt.trim().length > 0}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
					><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
						d="M501.6 4.186c-7.594-5.156-17.41-5.594-25.44-1.063L12.12 267.1C4.184 271.7-.5037 280.3 .0431 289.4c.5469 9.125 6.234 17.16 14.66 20.69l153.3 64.38v113.5c0 8.781 4.797 16.84 12.5 21.06C184.1 511 188 512 191.1 512c4.516 0 9.038-1.281 12.99-3.812l111.2-71.46l98.56 41.4c2.984 1.25 6.141 1.875 9.297 1.875c4.078 0 8.141-1.031 11.78-3.094c6.453-3.625 10.88-10.06 11.95-17.38l64-432C513.1 18.44 509.1 9.373 501.6 4.186zM369.3 119.2l-187.1 208.9L78.23 284.7L369.3 119.2zM215.1 444v-49.36l46.45 19.51L215.1 444zM404.8 421.9l-176.6-74.19l224.6-249.5L404.8 421.9z"
					/></svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
					><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
						d="M312.1 375c9.369 9.369 9.369 24.57 0 33.94s-24.57 9.369-33.94 0L160 289.9l-119 119c-9.369 9.369-24.57 9.369-33.94 0s-9.369-24.57 0-33.94L126.1 256L7.027 136.1c-9.369-9.369-9.369-24.57 0-33.94s24.57-9.369 33.94 0L160 222.1l119-119c9.369-9.369 24.57-9.369 33.94 0s9.369 24.57 0 33.94L193.9 256L312.1 375z"
					/></svg
				>
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
