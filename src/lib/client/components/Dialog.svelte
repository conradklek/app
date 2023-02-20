<script>
	export let modal
	let dialog
	let target
	$: modal && dialog?.showModal()
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
	<form
		method="dialog"
		bind:this={target}
		on:submit={() => {
			target.reset()
			modal = false
		}}
	>
		<header>
			<h1>Dialog</h1>
		</header>
		<section>
			<label for="prompt">Prompt</label>
			<textarea id="prompt" name="prompt" />
		</section>
		<footer>
			<button type="submit">Confirm</button>
		</footer>
	</form>
</dialog>
