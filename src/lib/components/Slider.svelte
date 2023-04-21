<script>
	export let label = "Number"
	export let value = 1
	export let step = 1
	export let min = 1
	export let max = 6
	export let id = crypto.randomUUID()
	$: {
		console.log(value)
	}
</script>

<div>
	<label for={id} class="block text-sm">{label}</label>
	<div class="flex flex-row items-center gap-3">
		<input type="range" bind:value {step} {min} {max} class="w-full h-2 bg-[hsl(240DEG,6%,9%)] rounded-lg appearance-none cursor-pointer" />
		<input {id} type="number" bind:value {step} {min} {max} class="w-16 pl-2.5 py-1 rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
	</div>
</div>
