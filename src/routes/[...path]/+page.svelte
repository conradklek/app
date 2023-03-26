<script>
	import { _caret, _chat, _command, _file, _folder } from "$lib/assets/svg"
	import { Chat, Code, Menu, Node } from "$lib/client/components"
	import { browser } from "$app/environment"
	export let data
	$: chat = null
	$: code = null
	$: node = null
	$: menu = null
	$: if (browser) console.log(data)
</script>

<header class="z-10 sticky top-0 left-0 flex flex-row items-center justify-between w-screen h-20 overflow-x-auto overflow-y-hidden bg-blue-500/50">
	{#if data.path?.length}
		<nav class="z-0 flex flex-row items-center justify-start gap-1 w-screen h-20 px-5">
			<a href="/{data.path.split('/').length > 1 ? data.path.split('/')[0] : ''}" class="flex items-center h-8 px-1.5 py-0.5 rounded-sm bg-blue-500/50">{data.path.split("/")[0]}</a>
			{#each data.path.split("/").slice(1) as path, i}
				<a
					href="/{data.path
						.split('/')
						.slice(0, i + 1)
						.join('/')}/{path}"
					class="flex flex-row items-center gap-1.5 h-8 px-1.5 py-0.5 rounded-sm whitespace-nowrap bg-blue-500/50"
				>
					<img alt="caret" src={_caret} class="block w-2 h-auto" />
					{path}
				</a>
			{/each}
		</nav>
	{/if}
	<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-end h-full aspect-[1/1] ml-auto pr-5 whitespace-nowrap">
		<button type="button" class="flex items-center justify-center w-8 h-8 rounded-sm bg-blue-500/50" on:click={() => node?.showModal()}>
			<img alt="command" src={_command} />
		</button>
	</div>
</header>

<main class="z-0 relative w-screen min-h-[calc(100vh-10rem)] mx-auto overflow-x-hidden">
	{#if data.load}
		{#if Object.keys(data.load).includes("contents")}
			{@const type = data.path?.split(".").pop()}
			{#if ["md", "js", "html", "css", "json"].includes(type)}
				<Code bind:code file={data.load.contents} {type} />
			{/if}
		{:else}
			<ul class="grid grid-cols-2 gap-2.5 p-5 bg-blue-500/50">
				{#each Object.keys(data.load)
					.map((item) => {
						return { name: item, item: data.load[item], kind: Object.keys(data.load[item]).includes("directory") ? "directory" : "file" }
					})
					.sort((a) => {
						return a.kind === "directory" ? -1 : 1
					}) as item (item.name)}
					<li
						class="flex flex-row items-center justify-start gap-1.5 w-full h-10 pr-1.5 col-span-1 bg-blue-500/25 focus-within:bg-blue-500/50 rounded-sm ring ring-transparent focus-within:ring-blue-500/20 focus-within:ring-offset-1 focus-within:ring-offset-blue-500/50"
						on:contextmenu|preventDefault={(e) => {
							menu = { x: e.clientX, y: e.clientY, item: item.item, path: data.path + "/" + item.name, kind: item.kind }
						}}
					>
						<div class="flex items-center justify-center h-full aspect-[1/1] bg-blue-500/25 rounded-l-sm pointer-events-none">
							<img alt={item.kind} src={item.kind === "directory" ? _folder : _file} class="block w-auto h-4 pointer-events-none" />
						</div>
						<a href="/{data.path}/{item.name}" class="px-1 py-0.5 line-clamp-1 focus:outline-none">{item.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>

<footer class="z-10 sticky bottom-0 right-0 flex flex-row items-center justify-between w-screen h-20 overflow-hidden bg-blue-500/50">
	<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-end h-full aspect-[1/1] ml-auto pr-5 whitespace-nowrap">
		<button type="button" class="flex items-center justify-center w-8 h-8 rounded-sm bg-blue-500/50" on:click={() => chat.showModal()}>
			<img alt="chat" src={_chat} />
		</button>
	</div>
</footer>

<Chat bind:chat bind:file={code} />

<Node bind:node path={data.path} load={data.load} file={code} />

{#if menu}
	<Menu bind:menu />
{/if}
