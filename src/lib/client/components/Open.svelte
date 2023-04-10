<script>
	import { onMount } from "svelte"
	import { lib } from "$lib/client/stores"
	import { Code } from "$lib/client/components"
	let node
	onMount(() => {
		node.showModal()
	})
</script>

<dialog
	bind:this={node}
	class="fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none m-0 p-0 bg-black bg-opacity-50"
	on:click={(e) => {
		if (e.target === node) {
			node.close()
			$lib.open = null
		}
	}}
	on:keydown={(e) => {
		if (e.key === "Escape") {
			node.close()
			$lib.open = null
		}
	}}
>
	{#if ["md", "js", "html", "css", "json"].includes($lib.open?.path.split(".").at(-1))}
		<Code bind:code={$lib.code} file={$lib.open.item.file.contents} type={$lib.open.path.split(".").at(-1)} />
	{/if}
</dialog>
