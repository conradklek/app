<script>
	import { onMount } from "svelte"
	export let messages = []
	export let controls = {}
	export let contents = ""
	onMount(() => {
		if (contents.length) {
			const data = JSON.parse(contents)
			console.log(data)
			messages = data.messages
			controls = data.controls
			console.log(messages)
			console.log(controls)
		} else {
			console.log("No contents")
			messages = []
			controls = {}
		}
	})
</script>

<form class="flex flex-col p-5">
	<label for="model">Model</label>
	<input id="model" type="text" />
	<label for="system">System Message</label>
	<input id="system" type="text" />
	<label for="temperature">Temperature</label>
	<input id="temperature" type="number" min="0" max="1" step="0.1" />
	<label for="topK">Top K</label>
	<input id="topK" type="number" min="0" max="100" step="1" />
	<label for="topP">Top P</label>
	<input id="topP" type="number" min="0" max="1" step="0.1" />
	<label for="maxTokens">Max Tokens</label>
	<input id="maxTokens" type="number" min="0" max="100" step="1" />
	<label for="stopSequences">Stop Sequences</label>
	<input id="stopSequences" type="text" />
	<label for="frequencyPenalty">Frequency Penalty</label>
	<input id="frequencyPenalty" type="number" min="0" max="1" step="0.1" />
	<label for="presencePenalty">Presence Penalty</label>
	<input id="presencePenalty" type="number" min="0" max="1" step="0.1" />
	<label for="logProbs">Log Probs</label>
	<input id="logProbs" type="number" min="0" max="1" step="0.1" />
</form>
