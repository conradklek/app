<script>
	import { _caret, _chat, _command, _file, _folder } from "$lib/assets/svg"
	import { Code, Node } from "$lib/client/components"
	export let data
	$: code = null
	$: node = null
</script>

{#if data.user?.username === data.path?.split("/")[0]}
	<header class="z-10 sticky top-0 left-0 grid grid-flow-col items-center justify-between w-screen h-16 bg-blue-500/40 border-b border-b-blue-500/25 shadow-[0_4px_0_hsla(220DEG,100%,50%,0.075)]">
		{#if data.path.length}
			<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-5">
				<a href="/{data.path.split('/').length > 1 ? data.path.split('/')[0] : ''}" class="block h-8 leading-8 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/40 ring-2 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">{data.path.split("/")[0]}</a>
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
					<a href="/{href}" class="block h-8 leading-8 mt-1 px-2 rounded-sm bg-blue-500/25 font-medium focus:bg-blue-500/40 ring-2 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">
						{path}
					</a>
				{/each}
			</nav>
		{/if}
		<div class="z-10 sticky top-0 right-0 flex flex-row items-center justify-center h-full aspect-[1/1] ml-auto whitespace-nowrap bg-blue-500/25 border-l border-l-blue-500/25">
			{#if data.load}
				<button type="button" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap bg-blue-500/25 focus:bg-blue-500/40 ring-2 ring-inset outline-[3px] outline-transparent focus:outline focus:outline-[3px] focus:outline-blue-500/25 ring-blue-500/25 focus:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]" on:click={() => node?.showModal()}>
					<img alt="command" src={_command} />
				</button>
			{/if}
		</div>
	</header>

	<main class="z-0 relative w-screen min-h-[calc(100vh-10rem)] mx-auto overflow-x-hidden">
		{#if data.load}
			{#if Object.keys(data.load).join("") === "contents"}
				{@const type = data.path?.split(".").pop()}
				{#if ["md", "js", "html", "css", "json"].includes(type)}
					<Code bind:code file={data.load.contents} {type} />
				{/if}
			{:else}
				<ul class="sm:grid sm:grid-cols-2 gap-2.5 max-w-xl mx-auto p-5">
					{#each Object.keys(data.load)
						.map((item) => {
							return { name: item, item: data.load[item], kind: [Object.keys(data.load[item]).join("")].includes("directory") ? "directory" : "file" }
						})
						.sort((a) => {
							return a.kind === "directory" ? -1 : 1
						}) as item (item.name)}
						<li class="flex flex-row items-center justify-start w-full h-10 pr-1.5 col-span-1 rounded-sm bg-blue-500/25 focus-within:bg-blue-500/40 hover:bg-blue-500/40 outline outline-[3px] outline-transparent focus-within:outline-[3px] focus-within:outline-blue-500/25 ring-2 ring-inset ring-blue-500/25 focus-within:ring-blue-500/20 shadow-[0_3px_0_hsla(220DEG,100%,50%,0.075)] focus-within:shadow-[0_0px_0_hsla(220DEG,100%,50%,0.075)]">
							<div class="flex items-center justify-center h-full aspect-[1/1] bg-blue-500/25 border-r border-blue-500/20 rounded-l-sm cursor-grab">
								<img alt={item.kind} src={item.kind === "directory" ? _folder : _file} class="pointer-events-none" />
							</div>
							{#if item.name.endsWith(".gpt") && item.kind === "file"}
								<div class="w-full h-full p-0.5 pl-2 line-clamp-1 leading-9 font-medium select-none cursor-not-allowed">{item.name}</div>
							{:else}
								<a href="/{data.path}/{item.name}" class="w-full h-full p-0.5 pl-2 line-clamp-1 leading-9 focus:outline-none font-medium select-none">{item.name}</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</main>

	<Node bind:node path={data.path} load={data.load} file={code} />
{/if}
