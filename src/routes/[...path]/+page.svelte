<script>
	import { page } from "$app/stores"
	import { Editor } from "$lib/client/components"
	import { webcontainer } from "$lib/client/stores/webcontainer"
</script>

<section>
	{#if $webcontainer && $page.data.path?.length}
		{#await $webcontainer.fs.readFile($page.data.path, "utf8") then file}
			<Editor
				{file}
				on:update={async (e) => {
					await $webcontainer.fs.writeFile($page.data.path, e.detail)
				}}
			/>
		{/await}
	{/if}
</section>
