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
	/*
	$: {
		if ($webcontainer?.terminal?.stream) {
			console.clear()
			console.log($webcontainer.terminal?.stream?.replace(ansiRegex(), "").split("❯ ").slice(-2).join("") + search)
			console.table(memory)
			if ($codemirror) console.log($codemirror)
		}
	}
	*/
</script>

<header>
	<div>
		<a href="/${$page.data.path?.length ? '/' + $page.data.path.split('/').slice(0, -1).join('/') : ''}">
			{#if $page.data.path?.length}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
					><path
						d="M448 256C448 264.8 440.6 272 431.4 272H54.11l140.7 149.3c6.157 6.531 5.655 16.66-1.118 22.59C190.5 446.6 186.5 448 182.5 448c-4.505 0-9.009-1.75-12.28-5.25l-165.9-176c-5.752-6.094-5.752-15.41 0-21.5l165.9-176c6.19-6.562 16.69-7 23.45-1.094c6.773 5.938 7.275 16.06 1.118 22.59L54.11 240h377.3C440.6 240 448 247.2 448 256z"
					/></svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
					><path
						d="M528 32h-96l-17.94-17.94C405.1 5.057 392.8 0 380.1 0H336C309.5 0 288 21.49 288 48v128C288 202.5 309.5 224 336 224h192C554.5 224 576 202.5 576 176v-96C576 53.49 554.5 32 528 32zM544 176C544 184.8 536.8 192 528 192h-192C327.2 192 320 184.8 320 176v-128C320 39.18 327.2 32 336 32h44.12c4.273 0 8.293 1.664 11.31 4.686L418.7 64H528C536.8 64 544 71.18 544 80V176zM528 320h-96l-17.94-17.94C405.1 293.1 392.8 288 380.1 288H336C309.5 288 288 309.5 288 336v128c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48v-96C576 341.5 554.5 320 528 320zM544 464c0 8.822-7.178 16-16 16h-192c-8.822 0-16-7.178-16-16v-128c0-8.822 7.178-16 16-16h44.12c4.273 0 8.293 1.664 11.31 4.686L418.7 352H528c8.822 0 16 7.178 16 16V464zM240 128C248.8 128 256 120.8 256 112S248.8 96 240 96H32V16C32 7.156 24.84 0 16 0S0 7.156 0 16v352C0 394.5 21.53 416 48 416h192C248.8 416 256 408.8 256 400S248.8 384 240 384h-192C39.17 384 32 376.8 32 368V128H240z"
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
			><path
				d="M447.1 0h-384c-35.25 0-64 28.75-64 63.1v287.1c0 35.25 28.75 63.1 64 63.1h96v83.1c0 9.838 11.03 15.55 19.12 9.7l124.9-93.7h144c35.25 0 64-28.75 64-63.1V63.1C511.1 28.75 483.2 0 447.1 0zM480 352c0 17.6-14.4 32-32 32h-144.1c-6.928 0-13.67 2.248-19.21 6.406L192 460v-60c0-8.838-7.164-16-16-16H64c-17.6 0-32-14.4-32-32V64c0-17.6 14.4-32 32-32h384c17.6 0 32 14.4 32 32V352zM128 184c-13.25 0-24 10.74-24 24c0 13.25 10.75 24 24 24S152 221.3 152 208C152 194.7 141.3 184 128 184zM384 184c-13.25 0-24 10.74-24 24c0 13.25 10.75 24 24 24s24-10.75 24-24C408 194.7 397.3 184 384 184zM256 184c-13.25 0-24 10.74-24 24c0 13.25 10.75 24 24 24s24-10.75 24-24C280 194.7 269.3 184 256 184z"
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
										><path
											d="M566.6 211.6C557.5 199.1 543.4 192 527.1 192H134.2C114.3 192 96.2 204.5 89.23 223.1L32 375.8V96c0-17.64 14.36-32 32-32h117.5c8.549 0 16.58 3.328 22.63 9.375L258.7 128H448c17.64 0 32 14.36 32 32h32c0-35.35-28.65-64-64-64H272L226.7 50.75C214.7 38.74 198.5 32 181.5 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h403.1c21.11 0 39.53-13.53 45.81-33.69l60-192C578.4 239.6 575.8 224 566.6 211.6zM543.2 244.8l-60 192C481.1 443.5 475 448 467.1 448H64c-3.322 0-6.357-.9551-9.373-1.898c-2.184-1.17-4.109-2.832-5.596-4.977c-3.031-4.375-3.703-9.75-1.828-14.73l72-192C121.5 228.2 127.5 224 134.2 224h393.8c5.141 0 9.844 2.375 12.89 6.516C543.9 234.7 544.8 239.9 543.2 244.8z"
										/></svg
									>
								{:else if type === "file"}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
										><path
											d="M0 64C0 28.65 28.65 0 64 0H220.1C232.8 0 245.1 5.057 254.1 14.06L369.9 129.9C378.9 138.9 384 151.2 384 163.9V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V64zM352 192H240C213.5 192 192 170.5 192 144V32H64C46.33 32 32 46.33 32 64V448C32 465.7 46.33 480 64 480H320C337.7 480 352 465.7 352 448V192zM347.3 152.6L231.4 36.69C229.4 34.62 226.8 33.18 224 32.48V144C224 152.8 231.2 160 240 160H351.5C350.8 157.2 349.4 154.6 347.3 152.6z"
										/></svg
									>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
										><path
											d="M447.1 96H272L226.7 50.75C214.7 38.74 198.5 32 181.5 32H63.1c-35.35 0-64 28.65-64 64v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V160C511.1 124.7 483.3 96 447.1 96zM480 416c0 17.64-14.36 32-32 32H64c-17.64 0-32-14.36-32-32V96c0-17.64 14.36-32 32-32h117.5c8.549 0 16.58 3.328 22.63 9.375L258.7 128H448c17.64 0 32 14.36 32 32V416z"
										/></svg
									>
								{/if}
							</span>
							<a href="/${path.slice(1) === $page.data.path ? path.split('/').slice(0, -1).join('/') : path}" class:active={path.slice(1) === $page.data.path}>
								{path.slice(1) === $page.data.path ? "../ " : ""}{path.split("/").pop()}
							</a>
						</li>
					{/each}
				</ul>
			{:else if Object.keys(item[1]).includes("file")}
				{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
					<Code {file} code={$codemirror} tabs={true} wrap={true} type={$page.data.path.split(".").pop()} on:update={async (e) => await $webcontainer.fs.writeFile($page.data.path, e.detail)} />
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
			<Code file={prompt} code={editor} wrap={true} on:update={(e) => (prompt = e.detail)} tabs={false} />
		{/if}
		<button type="submit">
			{#if prompt.trim().length > 0}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
					><path
						d="M498.1 5.629C492.7 1.891 486.4 0 480 0c-5.461 0-10.94 1.399-15.88 4.223l-448 255.1C5.531 266.3-.6875 277.8 .0625 289.1s8.375 22.86 19.62 27.55l103.2 43.01l61.85 146.5C186.2 510.6 189.2 512 191.1 512c2.059 0 4.071-.8145 5.555-2.24l85.75-82.4l120.4 50.16c4.293 1.793 8.5 2.472 12.29 2.472c6.615 0 12.11-2.093 15.68-4.097c8.594-4.828 14.47-13.31 15.97-23.05l64-415.1C513.5 24.72 508.3 12.58 498.1 5.629zM32 288l380.1-217.2l-288.2 255.5L32 288zM200.7 462.3L151.1 344.9l229.5-203.4l-169.5 233.1c-2.906 4-3.797 9.094-2.438 13.84c1.374 4.75 4.844 8.594 9.438 10.41l34.4 13.76L200.7 462.3zM416.7 443.3l-167.7-66.56l225.7-310.3L416.7 443.3z"
					/></svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
					><path
						d="M315.3 411.3c-6.253 6.253-16.37 6.253-22.63 0L160 278.6l-132.7 132.7c-6.253 6.253-16.37 6.253-22.63 0c-6.253-6.253-6.253-16.37 0-22.63L137.4 256L4.69 123.3c-6.253-6.253-6.253-16.37 0-22.63c6.253-6.253 16.37-6.253 22.63 0L160 233.4l132.7-132.7c6.253-6.253 16.37-6.253 22.63 0c6.253 6.253 6.253 16.37 0 22.63L182.6 256l132.7 132.7C321.6 394.9 321.6 405.1 315.3 411.3z"
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
