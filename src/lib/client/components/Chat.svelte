<script>
	import { _send, _save } from "$lib/assets/svg"
	export let messages = []
	export let controls = {}
	export let path
	export let chat
	let editor
	$: prompt = ""
	/*
	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	*/
	async function submit() {
		if (prompt.trim().length) {
			messages.push({ role: "user", content: prompt, id: crypto.randomUUID(), date: new Date().toISOString() })
			messages = messages
			prompt = ""
			const response = await fetch("/$/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages, controls, path })
			})
			const readable = response.body.getReader()
			const decoder = new TextDecoder()
			let message = { role: "assistant", content: "", id: crypto.randomUUID(), date: new Date().toISOString() }
			messages.push(message)
			messages = messages
			let regex = /data:\s*(\{[^}]*\})/g
			while (true) {
				const { done, value } = await readable.read()
				if (done) break
				const text = decoder.decode(value)
				let match
				while ((match = regex.exec(text)) !== null) {
					const chunk = match[1]
					let reg = /{"content":\s*(?:"([^"]*)"|null)/g
					let obj = reg.exec(chunk)
					if (obj) {
						message.content += obj[1] || ""
						messages = messages
					}
				}
			}
			console.log(message)
		} else {
			prompt = ""
			chat.close()
		}
		editor.focus()
	}
</script>

<dialog bind:this={chat} class="z-20 w-screen max-w-none max-h-none m-0 p-0 bg-transparent overflow-hidden">
	<ol
		class="flex flex-col-reverse gap-2 w-screen h-screen"
		on:click={(e) => {
			if (e.target === e.currentTarget) {
				prompt = ""
				chat.close()
			}
		}}
		on:keydown={(e) => {
			if (e.key === "Escape") {
				prompt = ""
				chat.close()
			}
		}}
	>
		<form method="dialog" on:submit|preventDefault={submit} class="sticky bottom-0 right-0 flex flex-row items-end w-full h-20 bg-white">
			<label for="message" class="w-full h-full flex flex-row items-center justify-center">
				<span class="sr-only px-1.5 py-1">Message</span>
				<textarea
					on:keydown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) e.preventDefault()
					}}
					on:keyup={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							if (!chat?.open || prompt?.length) submit()
						}
					}}
					id="message"
					type="text"
					name="message"
					autocomplete="off"
					class="w-full h-full resize-none p-2.5 focus:outline-none"
					bind:value={prompt}
					bind:this={editor}
				/>
			</label>
			<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap bg-blue-500/50">
				<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">
					<img alt="send" src={_send} />
				</button>
			</div>
		</form>
		{#each [...messages].reverse().filter((message) => message.role !== "system") as message (message.id || JSON.stringify(message))}
			<li class="flex flex-col items-start justify-start w-[calc(100vw-1.25rem)] mx-auto p-2.5 bg-white rounded-sm">
				<div class="flex flex-row items-center justify-between gap-1 w-full p-1">
					<span class="px-1">{message.role}</span>
				</div>
				<div class="flex flex-row items-center justify-between gap-1 w-full p-1">
					<span class="px-1">{message.content}</span>
				</div>
			</li>
		{/each}
	</ol>
	<!--
	<form action="/$/db" class="z-30 fixed top-0 right-0 w-20 h-20 flex items-center justify-center bg-blue-500/50">
		<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">
			<img alt="save" src={_save} />
		</button>
	</form>
	-->
</dialog>
