<script>
	import "../app.postcss"
	import { onMount } from "svelte"
	import { WebContainer } from "@webcontainer/api"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import localforage from "localforage"
	onMount(async () => {
		console.log(crossOriginIsolated)
		try {
			$webcontainer = await WebContainer.boot()
			$webcontainer.on("server-ready", (port, url) => {
				$webcontainer.host = url
				$webcontainer.port = port
				$webcontainer.pwd = `~/${new URL($webcontainer.host).host.split(".")[0].split("--")[0]}/`
			})
			await $webcontainer.mount((await localforage.getItem("indexedDB")) || {})
			$webcontainer.terminal = await $webcontainer.spawn("jsh")
			$webcontainer.terminal.stream = (await localforage.getItem("terminal")) || ""
			$webcontainer.terminal.output.pipeTo(
				new WritableStream({
					write(data) {
						$webcontainer.terminal.stream += data
					}
				})
			)
			$webcontainer.terminal.input = $webcontainer.terminal.input.getWriter()
			$webcontainer = $webcontainer
		} catch (e) {}
	})
</script>

{#if $webcontainer}
	<slot />
{/if}
