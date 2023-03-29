<script>
	import "xterm/css/xterm.css"
	import { onMount } from "svelte"
	import { wc } from "$lib/client/stores/wc"
	export let data
	let node
	async function pipe(stream) {
		const process = await stream
		process.output.pipeTo(
			new WritableStream({
				write(data) {
					$wc.terminal.write(data)
				}
			})
		)
		return process.exit
	}
	async function read(path) {
		const obj = {}
		const dir = await $wc.fs.readdir(path, { withFileTypes: true })
		for (const file of dir) {
			if (file.isDirectory()) {
				if (file.name === "node_modules" || file.name.startsWith(".") || file.name === "pnpm-lock.yaml") continue
				obj[file.name] = { directory: await read(`${path}/${file.name}`) }
			} else if (file.isFile()) {
				obj[file.name] = {
					file: {
						contents: await $wc.fs.readFile(`${path}/${file.name}`, "utf8")
					}
				}
			}
		}
		return obj
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
					$wc.terminal = terminal
					if (data.user.data["package.json"]) {
						const exit = await pipe($wc.spawn("pnpm", ["install"]))
						if (exit === 0) {
							const files = await read("/")
							console.log(files)
							terminal.writeln("Installation complete!")
							$wc.on("server-ready", async (port, url) => {
								$wc.src = url
							})
							await pipe($wc.spawn("pnpm", ["start"]))
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
	<iframe title={data.user.username} class="w-full h-[calc(100vh-5rem)] overflow-hidden" src={$wc?.src || ""} />
	<div bind:this={node} class="w-full h-[calc(100vh-5rem)] overflow-hidden" />
{/if}
