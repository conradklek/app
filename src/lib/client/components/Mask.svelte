<script>
	import { enhance } from "$app/forms"
	import { onMount } from "svelte"
	import { invalidateAll } from "$app/navigation"
	import { app } from "$lib/client/stores"
	export let path
	export let contents
	$: messages = []
	$: controls = {
		system: "You are an AI assistant.",
		temperature: 0.7,
		topP: 1.0,
		frequencyPenalty: 0.0,
		presencePenalty: 0.0,
		maxTokens: 2048,
		tools: ""
	}
	onMount(() => {
		if (contents.length) {
			const data = JSON.parse(contents)
			if (data.messages) {
				messages = data.messages || messages
			}
			if (data.controls) {
				controls = data.controls || controls
			}
			$app.agent.messages = data.messages
			$app.agent.controls = data.controls
		} else {
			$app.agent.messages = messages
			$app.agent.controls = controls
		}
		$app = $app
		$app.root.scrollTo(0, $app.root.scrollHeight)
	})
</script>

<form
	action="/$/ai/dall-e"
	method="POST"
	use:enhance={async () => {
		return async ({ result }) => {
			if (result["b64_json"]) {
				controls.imageURL = result["b64_json"]
				$app.agent.controls.imageURL = result["b64_json"]
				$app = $app
			}
		}
	}}
	class="flex flex-col gap-2.5 p-4"
>
	<div class="flex flex-col items-start justify-start gap-2.5">
		<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
			<div class="flex flex-row w-24 h-24 aspect-square rounded-sm">
				{#if controls?.imageURL}
					<img id="image" src="data:image/png;base64,{controls.imageURL}" class="w-full h-full object-cover rounded-sm" alt="Dall-e Generated Mask" />
				{/if}
			</div>
			<div class="flex flex-col w-full h-24">
				<div class="text-lg">
					{path.split("/").at(-1).slice(0, -4)}
				</div>
				<div class="pb-1.5 text-sm text-[hsl(240DEG,8%,32%)]">
					{$app.agent ? $app.agent.messages.length || 0 : $app.messages.length || 0} messages
				</div>
				<div class="w-full h-full flex flex-row items-end justify-end gap-2.5">
					<form
						action="/$/db"
						method="POST"
						use:enhance={async ({ data }) => {
							data.set("path", path)
							data.set("code", "echo")
							data.set("file", JSON.stringify({ messages, controls }))
							return async ({ result }) => {
								if (result.status === 200) {
									await invalidateAll()
									console.log(result)
								} else {
									console.log(result)
								}
							}
						}}
						class="flex flex-row w-full"
					>
						<button type="submit" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Save</button>
					</form>
					<form
						action="/$/db"
						method="POST"
						use:enhance={async ({ data, cancel }) => {
							console.log(path.split("/")[0])
							console.log(path.split("/").slice(1).join("/"))
							data.set("path", path.split("/")[0])
							data.set("code", "rm " + path.split("/").slice(1).join("/"))
							data.set("data", "{}")
							data.set("load", true)
							return async ({ result }) => {
								if (result.status === 200) {
									await invalidateAll()
									$app.agent = null
									$app = $app
									console.log(result)
								} else {
									console.log(result)
								}
							}
						}}
						class="flex flex-row w-full"
					>
						<button type="submit" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Delete</button>
					</form>
				</div>
			</div>
		</div>
		<label for="prompt" class="h-24 flex flex-col items-start justify-end w-full">
			<span class="pb-1.5 text-sm text-white focus:text-white mb-1 px-2">Profile Image</span>
			<textarea id="prompt" name="prompt" rows="5" spellcheck="false" class="w-full p-2 rounded-sm focus:outline-none text-sm text-[hsl(240DEG,8%,32%)] focus:text-white bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" bind:value={controls["prompt"]} />
		</label>
	</div>
	<button type="submit" class="w-full h-10 leading-10 ml-auto px-4 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Generate Image</button>
</form>

<div class="flex flex-col gap-5 p-4 pt-2.5">
	<div class="flex flex-col">
		<label for="system" class="pb-1.5 text-sm text-white focus:text-white mb-1 px-2">System</label>
		<div class="mb-2 p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">The system message that defines the character.</div>
		<textarea id="system" rows="7" class="px-2.5 py-1 rounded-sm focus:outline-none text-sm text-[hsl(240DEG,8%,32%)] focus:text-white bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" bind:value={controls["system"]} />
	</div>
	<div class="flex flex-col">
		<label for="temperature" class="flex flex-row items-center justify-between mb-2">
			<span class="pb-1.5 text-sm text-white focus:text-white">Temperature</span>
			<input id="temperature" type="number" min="0" max="1" step="0.1" bind:value={controls["temperature"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
		</label>
		<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.</div>
	</div>
	<div class="flex flex-col">
		<label for="topP" class="flex flex-row items-center justify-between mb-2">
			<span class="pb-1.5 text-sm text-white focus:text-white">Top P</span>
			<input id="topP" type="number" min="0" max="1" step="0.1" bind:value={controls["topP"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
		</label>
		<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.</div>
	</div>
	<div class="flex flex-col">
		<label for="frequencyPenalty" class="flex flex-row items-center justify-between mb-2">
			<span class="pb-1.5 text-sm text-white focus:text-white">Frequency Penalty</span>
			<input id="frequencyPenalty" type="number" min="0" max="1" step="0.1" bind:value={controls["frequencyPenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
		</label>
		<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.</div>
	</div>
	<div class="flex flex-col">
		<label for="presencePenalty" class="flex flex-row items-center justify-between mb-2">
			<span class="pb-1.5 text-sm text-white focus:text-white">Presence Penalty</span>
			<input id="presencePenalty" type="number" min="0" max="1" step="0.1" bind:value={controls["presencePenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
		</label>
		<div class="p-2 text-sm text-[hsl(240DEG,8%,32%)] focus:text-white text-blue-600 rounded-sm sr-only">How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.</div>
	</div>
</div>

<div class="w-full flex flex-row items-center justify-center mt-auto gap-2.5">
	<form
		action="/$/db"
		method="POST"
		use:enhance={async ({ data }) => {
			data.set("path", path)
			data.set("code", "echo")
			data.set("file", JSON.stringify({ messages: [], controls }))
			return async ({ result }) => {
				if (result.status === 200) {
					await invalidateAll()
					$app.agent.messages = []
					$app = $app
					console.log(result)
				} else {
					console.log(result)
				}
			}
		}}
		class="flex flex-row w-full px-5 pb-5"
	>
		<button type="submit" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">Clear Messages</button>
	</form>
</div>
