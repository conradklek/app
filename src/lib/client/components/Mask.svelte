<script>
	import { enhance, applyAction } from "$app/forms"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	export let contents
	$: messages = []
	$: controls = {
		system: "You are an AI assistant.",
		temperature: 0.7,
		topP: 1.0,
		frequencyPenalty: 0.0,
		presencePenalty: 0.0
	}
	onMount(() => {
		if (contents.length) {
			const data = JSON.parse(contents)
			console.log(data)
			if (data.messages) {
				messages = data.messages
			}
			if (data.controls) {
				controls = data.controls
			}
		} else {
			console.log("No contents")
		}
	})
	$: {
		console.log(messages)
		console.log(controls)
	}
</script>

<form
	action="/$/ai/dall-e"
	method="POST"
	use:enhance={async ({ form, data, action, cancel, submitter }) => {
		return async ({ result }) => {
			if (result["b64_json"]) {
				controls.imageURL = result["b64_json"]
			}
		}
	}}
	class="flex flex-col gap-2.5 px-5 pt-4"
>
	<div class="flex flex-row items-start justify-start gap-2.5">
		<div class="flex flex-col w-24 h-24 aspect-square rounded-sm bg-blue-500/50">
			{#if controls?.imageURL}
				<img id="image" src="data:image/png;base64,{controls.imageURL}" class="w-full h-full object-cover rounded-sm" alt="Dall-e Generated" />
			{/if}
		</div>
		<label for="prompt" class="h-24 flex flex-col items-start justify-end w-full">
			<span class="text-sm font-medium mb-1 px-2">Profile Image</span>
			<textarea id="prompt" name="prompt" rows="3" class="w-full px-2 py-1.5 rounded-sm focus:outline-none" bind:value={controls["prompt"]} />
		</label>
	</div>
	<button type="submit" class="h-10 leading-10 ml-auto px-4 text-white rounded-sm bg-blue-600 focus:outline-none">Generate Image</button>
</form>

<form class="flex flex-col gap-5 p-5 pt-2.5">
	<div class="flex flex-col">
		<label for="system" class="text-sm font-medium mb-1 px-2">System</label>
		<div class="mb-2 p-2 text-sm text-blue-600 rounded-sm bg-blue-500/50">The system message that defines the character.</div>
		<textarea id="system" rows="4" class="px-4 py-3.5 rounded-sm focus:outline-none" bind:value={controls["system"]} />
	</div>
	<div class="flex flex-col">
		<label for="temperature" class="flex flex-row items-center justify-between mb-2">
			<span class="text-sm font-medium">Temperature</span>
			<input id="temperature" type="number" min="0" max="1" step="0.1" bind:value={controls["temperature"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none" />
		</label>
		<div class="p-2 text-sm text-blue-600 rounded-sm bg-blue-500/50">Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.</div>
	</div>
	<div class="flex flex-col">
		<label for="topP" class="flex flex-row items-center justify-between mb-2">
			<span class="text-sm font-medium">Top P</span>
			<input id="topP" type="number" min="0" max="1" step="0.1" bind:value={controls["topP"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none" />
		</label>
		<div class="p-2 text-sm text-blue-600 rounded-sm bg-blue-500/50">Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.</div>
	</div>
	<div class="flex flex-col">
		<label for="frequencyPenalty" class="flex flex-row items-center justify-between mb-2">
			<span class="text-sm font-medium">Frequency Penalty</span>
			<input id="frequencyPenalty" type="number" min="0" max="1" step="0.1" bind:value={controls["frequencyPenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none" />
		</label>
		<div class="p-2 text-sm text-blue-600 rounded-sm bg-blue-500/50">How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.</div>
	</div>
	<div class="flex flex-col">
		<label for="presencePenalty" class="flex flex-row items-center justify-between mb-2">
			<span class="text-sm font-medium">Presence Penalty</span>
			<input id="presencePenalty" type="number" min="0" max="1" step="0.1" bind:value={controls["presencePenalty"]} class="h-9 mb-1 px-2 rounded-sm focus:outline-none" />
		</label>
		<div class="p-2 text-sm text-blue-600 rounded-sm bg-blue-500/50">How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.</div>
	</div>
</form>

<form
	action="/$/db"
	method="POST"
	use:enhance={async ({ form, data, action, cancel, submitter }) => {
		data.set("path", $page.data.path)
		data.set("code", "echo")
		data.set("file", JSON.stringify({ messages, controls }))
		return async ({ result }) => {
			if (result.status === 200) {
				await applyAction(result)
				console.log(result)
			} else {
				console.log(result)
			}
		}
	}}
	class="flex flex-row gap-2.5 px-5 pb-5"
>
	<button type="submit" class="w-full h-10 leading-10 px-4 text-white rounded-sm bg-blue-600 focus:outline-none">Save Changes</button>
</form>
