<script>
	import { page } from "$app/stores"
	import { webcontainer } from "$lib/client/stores/webcontainer"
	$: {
		console.clear()
		console.table($page.data)
		console.log($webcontainer)
	}
</script>

<section>
	{#if $page.data.path?.length}
		<textarea />
	{/if}
</section>
<section>
	<iframe title="app" />
</section>
