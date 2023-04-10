<script>
	import { Book } from "$lib/client/components"
	import { app, lib } from "$lib/client/stores"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	async function read(path) {
		const obj = {}
		const dir = await $lib.host.fs.readdir(path, { withFileTypes: true })
		for (const file of dir) {
			if (file.isDirectory()) {
				if (file.name === "node_modules" || file.name.startsWith(".") || file.name === "pnpm-lock.yaml") continue
				obj[file.name] = { directory: await read(`${path}/${file.name}`) }
			} else if (file.isFile()) {
				obj[file.name] = {
					file: {
						contents: await $lib.host.fs.readFile(`${path}/${file.name}`, "utf8")
					}
				}
			}
		}
		return obj
	}
	onMount(() => {
		$app.root.scrollTo(0, $app.root.scrollHeight)
	})
</script>

<div class="flex flex-col items-start justify-start gap-2.5 p-4 pb-1.5">
	<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
		<div class="flex flex-row w-24 h-24 aspect-square rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" />
		<div class="w-full flex flex-col h-24">
			<div class="text-lg">{$page.data.user.username}</div>
			<div class="text-sm text-[hsl(240DEG,8%,32%)]">{$app.messages?.length || 0} Messages</div>
			<div class="grid grid-cols-2 gap-x-2.5 mt-auto">
				<button type="button" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 select-none whitespace-nowrap">Save</button>
				<form action="/?/logout" method="POST" class="w-full">
					<button type="submit" class="w-full h-10 leading-10 px-4 rounded-sm focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 select-none whitespace-nowrap">Exit</button>
				</form>
			</div>
		</div>
	</div>
</div>
<div class="flex flex-col w-full px-2.5">
	{#if $lib.host}
		{#await read("/") then data}
			<Book {data} path={$page.data.user.username} />
		{/await}
	{/if}
</div>
