<script>
	import "../app.postcss"
	import { onMount } from "svelte"
	import { WebContainer } from "@webcontainer/api"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import localforage from "localforage"
	onMount(async () => {
		$webcontainer = await WebContainer.boot()
		await $webcontainer.mount((await localforage.getItem("indexedDB")) || {})
		$webcontainer.on("server-ready", (port, url) => {
			console.log("server-ready", port, url)
			$webcontainer.host = url
		})
	})
</script>

<slot />
