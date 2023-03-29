<script>
	import { enhance, applyAction } from "$app/forms"
	export let messages = []
	export let controls = {}
	export let load
	export let path
	export let file
	export let node = null
	async function upload(handler, path = "", data = {}) {
		if (!handler) {
			handler = await window.showDirectoryPicker()
			return { [handler.name]: { directory: await upload(handler, handler.name) } }
		}
		for await (const entry of handler.values()) {
			if (entry.name === "node_modules" || entry.name.startsWith(".") || entry.name === "pnpm-lock.yaml") continue
			if (entry.kind === "directory") {
				data[entry.name] = {
					directory: await upload(entry, `${path}/${entry.name}`, {})
				}
			} else if (entry.kind === "file") {
				const text = await entry.getFile().then((file) => file.text())
				data[entry.name] = {
					file: {
						contents: text
					}
				}
			}
		}
		return data
	}
</script>

<dialog
	bind:this={node}
	class="z-20 w-screen max-w-none max-h-none m-0 p-0 bg-transparent overflow-hidden"
	on:click={(e) => {
		if (e.target === e.currentTarget) {
			node.close()
		}
	}}
	on:keydown={(e) => {
		if (e.key === "Escape") {
			node.close()
		}
	}}
>
	<form
		action="/$/db"
		method="POST"
		use:enhance={async ({ form, data, action, cancel, submitter }) => {
			const code = data.get("code")
			if (code.trim().length) {
				if (code.trim().toLowerCase() === "load") {
					data.set("load", JSON.stringify(await upload()))
				}
			} else {
				cancel()
			}
			data.set("data", JSON.stringify(load))
			if (path.endsWith(".gpt")) {
				data.set("file", JSON.stringify({ messages, controls }))
			} else {
				data.set("file", file?.viewState?.state.doc.toString() ?? null)
			}
			data.set("path", path)
			form.reset()
			return async ({ result }) => {
				if (result.status === 200) {
					await applyAction(result)
				} else {
					console.log(result)
				}
			}
		}}
		class="flex flex-row items-center justify-center w-screen h-10 my-5"
	>
		<label for="code" class="block w-full">
			<span class="sr-only">Command</span>
			<input type="text" id="code" name="code" autocomplete="off" class="w-full h-10 p-2.5 leading-10 focus:outline-none" />
		</label>
	</form>
</dialog>
