<script>
	import { createEventDispatcher } from "svelte"
	export let modal
	let dialog
	let target
	const dispatch = createEventDispatcher()
	$: modal && dialog?.showModal()
	function submit() {
		dispatch("submit", new FormData(target).get("prompt"))
		target.reset()
		modal = false
	}
</script>

<dialog
	bind:this={dialog}
	on:click={(e) => {
		if (e.target === dialog) {
			dialog.close()
			target.reset()
			modal = false
		}
	}}
	on:keydown={(e) => {
		if (e.key === "Escape") {
			dialog.close()
			target.reset()
			modal = false
		}
	}}
>
	<form method="dialog" bind:this={target} on:submit={submit}>
		<header>
			<h1>Dialog</h1>
		</header>
		<section>
			<label for="prompt">Prompt</label>
			<input type="text" id="prompt" name="prompt" autocomplete="off" />
		</section>
		<footer>
			<button type="submit">Confirm</button>
		</footer>
	</form>
</dialog>
