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
	{#if $webcontainer && $page.data.path?.length}
		{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
			<textarea
				on:keyup={async (e) => {
					await $webcontainer.fs.writeFile($page.data.path, e.target.value)
				}}>{file}</textarea
			>
		{/await}
	{/if}
</section>
<section>
	<iframe title="app" />
</section>
