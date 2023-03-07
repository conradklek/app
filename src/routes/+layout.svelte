<script>
	import "../app.postcss"
	import { onMount } from "svelte"
	import { WebContainer } from "@webcontainer/api"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	import localforage from "localforage"
	onMount(async () => {
		if (crossOriginIsolated) {
			try {
				$webcontainer = await WebContainer.boot()
				$webcontainer.on("server-ready", (port, url) => {
					$webcontainer.host = url
					$webcontainer.port = port
					$webcontainer.pwd = `~/${new URL($webcontainer.host).host.split(".")[0].split("--")[0]}/`
					console.log("Server ready", $webcontainer.host, $webcontainer.port, $webcontainer.pwd)
				})
				await $webcontainer.mount((await localforage.getItem("indexedDB")) || {})
				$webcontainer.terminal = await $webcontainer.spawn("jsh")
				$webcontainer.terminal.stream = ""
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
		} else {
			$webcontainer = false
		}
	})
</script>

{#if $webcontainer}
	<slot />
{/if}
