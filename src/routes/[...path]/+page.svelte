<script>
	export let data
	$: {
		console.log(data.path)
		console.log(data.load)
	}
</script>

<div style="fixed inset-0 w-screen h-screen overflow-y-auto">
	<pre class="p-8 text-sm">{JSON.stringify(data.load, null, 2)}</pre>
</div>
