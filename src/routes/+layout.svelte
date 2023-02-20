<script>
	import "../app.postcss"
	import { onMount } from "svelte"
	import { Dialog, Finder } from "$lib/client/components"
	import { WebContainer } from "@webcontainer/api"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import localforage from "localforage"
	$: modal = false
	$: files = {}
	let iframe
	async function save() {
		const files = await read("/")
		await localforage.setItem("indexedDB", files)
		console.log("saved", files)
	}
	async function read(path) {
		const obj = {}
		const dir = await $webcontainer.fs.readdir(path, { withFileTypes: true })
		for (const file of dir) {
			if (file.isDirectory()) {
				if (file.name === "node_modules") continue
				obj[file.name] = { directory: await read(`${path}/${file.name}`) }
			} else if (file.isFile()) {
				obj[file.name] = {
					file: {
						contents: await $webcontainer.fs.readFile(`${path}/${file.name}`, "utf8")
					}
				}
			}
		}
		if (path === "/") files = obj
		return obj
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
	onMount(async () => {
		$webcontainer = await WebContainer.boot()
		await $webcontainer.mount((await localforage.getItem("indexedDB")) || {})
		await read("/")
		$webcontainer.on("server-ready", (port, url) => {
			iframe.src = url
		})
	})
</script>

<Dialog
	bind:modal
	on:submit={async (e) => {
		const cmnd = e.detail.trim().split(" ")[0]
		const args = e.detail.trim().split(" ").slice(1)
		if (cmnd === "read") {
			console.log(files)
		} else if (cmnd === "save") {
			await save()
		} else if (cmnd === "install") {
			await pipe($webcontainer.spawn("pnpm", ["install"]))
		} else {
			await pipe($webcontainer.spawn(cmnd, args))
		}
		await read("/")
	}}
/>

<header />

<nav>
	<button type="button" on:click={() => (modal = true)}>open</button>
</nav>

<aside>
	<Finder data={files} let:item let:src let:dir>
		{#if dir}
			<span class="font-medium">{src}</span>
		{:else}
			<a href={src}>{item}</a>
		{/if}
	</Finder>
</aside>

<main>
	<slot />
	<section>
		<iframe title="app" bind:this={iframe} />
	</section>
</main>

<footer />

<nav />
