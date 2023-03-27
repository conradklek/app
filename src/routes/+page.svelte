<script>
	import "xterm/css/xterm.css"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import { wc } from "$lib/client/stores/wc"
	export let data
	let node
	async function init(terminal) {
		const installProcess = await $wc.spawn("pnpm", ["install"])
		installProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					terminal.write(data)
				}
			})
		)
		return installProcess.exit
	}
	onMount(async () => {
		if (data.user) {
			const { Terminal } = await import("xterm")
			const terminal = new Terminal({
				convertEol: true
			})
			terminal.open(node)
			if (!$wc) {
				try {
					const { WebContainer } = await import("@webcontainer/api")
					$wc = await WebContainer.boot()
					await $wc.mount(data.user.data)
					if (data.user.data["package.json"]) {
						const json = JSON.parse(data.user.data["package.json"].file.contents)
						console.log(json)
						const exit = await init(terminal)
						if (exit === 0) {
							const serverProcess = await $wc.spawn("pnpm", ["start"])
							serverProcess.output.pipeTo(
								new WritableStream({
									write(data) {
										terminal.write(data)
									}
								})
							)
							$wc.on("server-ready", (port, url) => {
								$wc.src = url
							})
							terminal.writeln("Installation complete!")
						} else {
							terminal.writeln("Installation failed!")
						}
					}
				} catch (error) {
					console.error(error)
				}
			}
		}
	})
	$: {
		if (browser) console.log(data)
	}
</script>

{#if !data.user}
	<form action="?/login" method="POST" class="flex flex-col items-start justify-start p-5">
		<label for="email">Email</label>
		<input type="email" name="email" id="email" />
		<label for="password">Password</label>
		<input type="password" name="password" id="password" />
		<button type="submit">Login</button>
	</form>
{:else}
	<form action="?/logout" method="POST" class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-20 px-5 overflow-auto bg-blue-500/50 border-b border-b-blue-500/25 shadow-[0_4px_0_hsla(220DEG,100%,50%,0.075)]">
		<a href="/{data.user.username}" class="block h-8 px-1.5 font-medium leading-8 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">{data.user.username}</a>
		<button type="submit" class="block h-8 px-1.5 font-medium leading-8 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">Logout</button>
	</form>
{/if}

<iframe title={data.user.username} class="w-full h-[calc(100vh-5rem)] overflow-hidden" src={$wc?.src || ""} />

<div bind:this={node} class="w-full h-[calc(100vh-5rem)] overflow-hidden" />
