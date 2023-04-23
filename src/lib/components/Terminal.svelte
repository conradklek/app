<script>
	import "xterm/css/xterm.css"
	import { onMount, createEventDispatcher } from "svelte"
	export let webcontainerInstance
	export let stream = ""

	let terminalEl
	let terminal
	let fitAddon
	let shellProcess

	const dispatch = createEventDispatcher()

	onMount(async () => {
		const { Terminal } = await import("xterm")
		const { FitAddon } = await import("xterm-addon-fit")
		fitAddon = new FitAddon()
		terminal = new Terminal({
			convertEol: true
		})
		terminal.loadAddon(fitAddon)
		terminal.open(terminalEl)
		fitAddon.fit()
		shellProcess = await startShell(terminal)
	})

	async function startShell(terminal) {
		const shellProcess = await webcontainerInstance.spawn("jsh", {
			terminal: {
				cols: terminal.cols,
				rows: terminal.rows
			}
		})
		shellProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					terminal.write(data)
					stream += data
				}
			})
		)

		const input = shellProcess.input.getWriter()

		terminal.onData((data) => {
			input.write(data)
			if (data === "\r") {
				dispatch("update", stream)
				stream = ""
			}
		})

		return shellProcess
	}
</script>

<svelte:window
	on:resize={() => {
		if (fitAddon && terminal && shellProcess) {
			fitAddon.fit()
			shellProcess.resize({
				cols: terminal.cols,
				rows: terminal.rows
			})
		}
	}}
/>

<div bind:this={terminalEl} class="w-full h-full" />
