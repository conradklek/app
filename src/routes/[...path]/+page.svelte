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

<header class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-20 overflow-auto bg-blue-500/50 border-b border-b-blue-500/25">
	{#if data.path?.length}
		<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-5">
			<a href="/{data.path.split('/').length > 1 ? data.path.split('/')[0] : ''}" class="block h-8 px-1.5 leading-8 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50">{data.path.split("/")[0]}</a>
			{#each data.path.split("/").slice(1) as path, i}
				<div class="flex flex-row items-center justify-center pointer-events-none">
					<img alt="caret" src={_caret} class="block w-2 h-auto" />
				</div>
				<a
					href="/{data.path
						.split('/')
						.slice(0, i + 1)
						.join('/')}/{path}"
					class="block h-8 px-1.5 leading-8 rounded-sm whitespace-nowrap focus:outline-none bg-blue-500/25 focus:bg-blue-500/50 ring ring-transparent focus:ring-blue-500/20 focus:ring-offset-1 focus:ring-offset-blue-500/50"
				>
					{path}
				</a>
			{/each}
		</nav>
	{/if}
	<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap">
		<button type="button" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20" on:click={() => node?.showModal()}>
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
			<ul class="grid grid-cols-2 gap-2.5 p-5 bg-blue-500/25 border-b border-b-blue-500/25">
				{#each Object.keys(data.load)
					.map((item) => {
						return { name: item, item: data.load[item], kind: Object.keys(data.load[item]).includes("directory") ? "directory" : "file" }
					})
					.sort((a) => {
						return a.kind === "directory" ? -1 : 1
					}) as item (item.name)}
					<li
						class="flex flex-row items-center justify-start gap-1.5 w-full h-10 pr-1.5 col-span-1 bg-blue-500/25 focus-within:bg-blue-500/50 rounded-sm outline outline-[3px] outline-transparent focus-within:outline-[3px] focus-within:outline-blue-500/25 ring-1 ring-inset ring-blue-500/25 focus-within:ring-blue-500/20"
						on:contextmenu|preventDefault={(e) => {
							menu = { x: e.clientX, y: e.clientY, item: item.item, path: data.path + "/" + item.name, kind: item.kind }
						}}
					>
						<div class="flex items-center justify-center h-full aspect-[1/1] bg-blue-500/25 border-r border-blue-500/20 rounded-l-sm pointer-events-none">
							<img alt={item.kind} src={item.kind === "directory" ? _folder : _file} />
						</div>
						<a href="/{data.path}/{item.name}" class="px-0.5 py-0.5 line-clamp-1 focus:outline-none text-sm font-medium">{item.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>

<footer class="z-10 sticky bottom-0 right-0 flex flex-row items-center justify-between w-screen h-20 overflow-hidden bg-blue-500/50 border-t border-t-blue-500/25">
	<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap">
		<button type="button" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20" on:click={() => chat.showModal()}>
			<img alt="chat" src={_chat} />
		</button>
	</div>
</footer>

<Chat bind:chat bind:file={code} />

<Node bind:node path={data.path} load={data.load} file={code} />

{#if menu}
	<Menu bind:menu />
{/if}
