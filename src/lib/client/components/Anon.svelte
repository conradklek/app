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

<div class="flex flex-col items-start justify-start gap-2.5 p-4">
	<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
		<div class="flex flex-row w-24 h-24 aspect-square rounded-sm ring-inset ring-2 ring-indigo-300" />
		<div class="w-full flex flex-col h-24">
			<div class="text-lg font-medium">{$page.data.user.username}</div>
			<div class="text-sm font-medium">{$app.messages?.length || 0} Messages</div>
			<div class="grid grid-cols-2 gap-x-2.5 mt-auto">
				<button type="button" class="w-full h-10 leading-10 px-4 font-medium rounded-sm focus:outline-none ring-inset ring-2 ring-indigo-300 focus:ring-indigo-400 select-none whitespace-nowrap">Save</button>
				<form action="/?/logout" method="POST" class="w-full">
					<button type="submit" class="w-full h-10 leading-10 px-4 font-medium rounded-sm focus:outline-none ring-inset ring-2 ring-indigo-300 focus:ring-indigo-400 select-none whitespace-nowrap">Exit</button>
				</form>
			</div>
		</div>
	</div>
</div>
<div class="flex flex-col w-full px-2.5 pb-5">
	{#if $lib.host}
		{#await read("/") then data}
			<Book {data} path={$page.data.user.username} />
		{/await}
	{/if}
</div>
