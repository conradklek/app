<script>
	import { invalidateAll } from "$app/navigation"
	import { enhance } from "$app/forms"
	import { _caret, _chat, _command, _file, _folder } from "$lib/assets/svg"
	import { Chat, Code, Mask, Menu, Node } from "$lib/client/components"
	export let data
	$: chat = null
	$: code = null
	$: node = null
	$: menu = null
	$: bool = true
	$: {
		console.log(data)
	}
</script>

{#if data.user?.username === data.path?.split("/")[0]}
	<header class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-20 overflow-auto bg-blue-500/50 border-b border-b-blue-500/25 shadow-[0_4px_0_hsla(220DEG,100%,50%,0.075)]">
		{#if data.path.length}
			<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-5">
				<a
					href="/{data.path.split('/').length > 1 ? data.path.split('/')[0] : ''}"
					class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]"
					on:contextmenu|preventDefault={(e) => {
						if (menu) menu = null
						menu = { x: e.clientX, y: e.clientY, item: null, path: data.path.split("/")[0], kind: "directory" }
					}}>{data.path.split("/")[0]}</a
				>
				{#each data.path.split("/").slice(1) as path, i}
					{@const href =
						data.path
							.split("/")
							.slice(0, i + 1)
							.join("/") +
						"/" +
						path}
					<div class="h-8 flex flex-row items-center justify-center pt-1 pointer-events-none">
						<img alt="caret" src={_caret} class="block w-2 h-auto" />
					</div>
					<a
						href="/{href}"
						class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]"
						on:contextmenu|preventDefault={(e) => {
							if (menu) menu = null
							menu = {
								x: e.clientX,
								y: e.clientY,
								item: null,
								path: href,
								kind: null
							}
						}}
					>
						{path}
					</a>
				{/each}
			</nav>
		{/if}
		<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap bg-blue-500/25 border-l border-l-blue-500/25">
			{#if data.load}
				{#if Object.keys(data.load).join("") !== "directory" && data.path?.endsWith(".gpt")}
					<button type="button" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" on:click={() => chat.showModal()}>
						<img alt="chat" src={_chat} />
					</button>
				{:else}
					<button type="button" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" on:click={() => node?.showModal()}>
						<img alt="command" src={_command} />
					</button>
				{/if}
			{/if}
		</div>
	</header>

	<main class="z-0 relative w-screen min-h-[calc(100vh-10rem)] mx-auto overflow-x-hidden">
		{#if data.load}
			{#if Object.keys(data.load).join("") === "contents"}
				{@const type = data.path?.split(".").pop()}
				{#if ["md", "js", "html", "css", "json"].includes(type)}
					<Code bind:code file={data.load.contents} {type} />
				{:else if ["gpt"].includes(type)}
					<Mask contents={data.load.contents} />
				{/if}
			{:else}
				<form class="flex flex-col items-start justify-start w-full p-5 bg-blue-500/40 border-b border-b-blue-500/25 shadow-[inset_0_-4px_0_hsla(220DEG,100%,50%,0.075)]">
					<label for="create_folder_or_file_toggle" class="h-7 -mt-2 px-2.5 font-medium select-none">Create new...</label>
					<input id="create_folder_or_file_toggle" type="checkbox" class="hidden" bind:checked={bool} />
					<div class="w-full flex flex-row items-center justify-center ring-1 ring-inset ring-blue-500/25 rounded-sm">
						<button type="button" on:click={() => (bool = true)} class:opacity-50={!bool} class="flex items-center justify-center h-10 px-2.5 rounded-l-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset focus:outline-none ring-blue-500/25 focus:ring-blue-500/20 font-medium select-none">File</button>
						<button type="button" on:click={() => (bool = false)} class:opacity-50={bool} class="flex items-center justify-center h-10 -mx-px px-2.5 whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset focus:outline-none ring-blue-500/25 focus:ring-blue-500/20 font-medium select-none">Folder</button>
						<input type="text" class="w-full h-10 px-2.5 rounded-r-sm bg-blue-500/25 focus:bg-blue-500/50 ring-1 ring-inset focus:outline-none ring-blue-500/25 focus:ring-blue-500/20" />
					</div>
				</form>
				<ul class="grid grid-cols-2 gap-2.5 p-5 bg-blue-500/25 border-b border-b-blue-500/25">
					{#each Object.keys(data.load)
						.map((item) => {
							return { name: item, item: data.load[item], kind: [Object.keys(data.load[item]).join("")].includes("directory") ? "directory" : "file" }
						})
						.sort((a) => {
							return a.kind === "directory" ? -1 : 1
						}) as item (item.name)}
						<li
							class="flex flex-row items-center justify-start w-full h-10 pr-1.5 col-span-1 rounded-sm bg-blue-500/25 focus-within:bg-blue-500/50 hover:bg-blue-500/40 outline outline-[3px] outline-transparent focus-within:outline-[3px] focus-within:outline-blue-500/25 ring-1 ring-inset ring-blue-500/25 focus-within:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus-within:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]"
							on:contextmenu|preventDefault={(e) => {
								if (menu) menu = null
								menu = { x: e.clientX, y: e.clientY, item: item.item, path: data.path + "/" + item.name, kind: item.kind }
							}}
						>
							<div class="flex items-center justify-center h-full aspect-[1/1] bg-blue-500/25 border-r border-blue-500/20 rounded-l-sm cursor-grab">
								<img alt={item.kind} src={item.kind === "directory" ? _folder : _file} class="pointer-events-none" />
							</div>
							<a href="/{data.path}/{item.name}" class="w-full h-full p-0.5 pl-2 line-clamp-1 leading-9 focus:outline-none font-medium">{item.name}</a>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</main>

	{#if Object.keys(data.load).join("") !== "directory" && data.path?.endsWith(".gpt")}
		<Chat bind:chat path={data.path} controls={data.load?.contents?.length ? JSON.parse(data.load.contents).controls : {}} messages={data.load?.contents?.length ? JSON.parse(data.load.contents).messages : []} />
	{/if}

	<Node bind:node path={data.path} load={data.load} file={code} />

	{#if menu}
		<Menu bind:menu>
			<form
				method="POST"
				action="/{menu.path}?/pwd"
				use:enhance={async () => {
					return async ({ result }) => {
						console.log(result)
						if (result?.status === 200) {
							console.log(result.data.path)
							menu = null
						}
					}
				}}
				class="flex flex-row items-center justify-center w-full h-8 bg-blue-500/50"
			>
				<button type="submit" class="w-full h-full px-1.5 leading-8 text-left">pwd</button>
			</form>
			{#if menu.item}
				<form
					method="POST"
					action="/{menu.path}?/rm"
					use:enhance={async () => {
						return async ({ result }) => {
							console.log(result)
							if (result?.status === 200) {
								await invalidateAll()
								menu = null
							}
						}
					}}
					class="flex flex-row items-center justify-center w-full h-8 bg-blue-500/50"
				>
					<button type="submit" class="w-full h-full px-1.5 leading-8 text-left">rm</button>
				</form>
			{/if}
		</Menu>
	{/if}
{/if}
