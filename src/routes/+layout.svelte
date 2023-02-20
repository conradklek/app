<script>
	import "../app.postcss"
	import { onMount } from "svelte"
	import { Dialog } from "$lib/client/components"
	import { WebContainer } from "@webcontainer/api"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import localforage from "localforage"
	$: modal = false
	async function read(path) {
		const obj = {}
		const dir = await $webcontainer.fs.readdir(path, { withFileTypes: true })
		for (const file of dir) {
			if (file.isDirectory()) {
				obj[file.name] = { directory: await readDirectory(`${path}/${file.name}`) }
			} else if (file.isFile()) {
				obj[file.name] = {
					file: {
						contents: await $webcontainer.fs.readFile(`${path}/${file.name}`, "utf8")
					}
				}
			}
		}
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
	})
	function spawn(text) {
		const cmnd = text.trim().split(" ")[0]
		const args = text.trim().split(" ").slice(1)
		return { cmnd, args }
	}
</script>

<Dialog
	bind:modal
	on:submit={async (e) => {
		const { cmnd, args } = spawn(e.detail)
		if (cmnd === "read") {
			const files = await read("/")
			console.log(files)
		} else if (cmnd === "save") {
			await localforage.setItem("indexedDB", await read("/"))
		} else {
			await pipe($webcontainer.spawn(cmnd, args))
		}
	}}
/>

<header />

<nav>
	<button type="button" on:click={() => (modal = true)}>open</button>
</nav>

<aside />

<main>
	<slot />
</main>

<footer />

<nav />
