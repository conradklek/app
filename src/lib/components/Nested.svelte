<script>
	import { library } from "$lib/stores/library"
	import { _file, _folder, _folder_open } from "$lib/assets/svg"
	export let data = {}
	export let path = ""
	$: keys = Object.keys(data)
	$: open = (key) => ($library.open?.path === key ? true : false)
	$: show = null
</script>

<ul class="bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 rounded-sm [&_ul]:rounded-none overflow-hidden">
	{#each keys as key (path + "/" + key)}
		{@const item = data[key]}
		{@const kind = Object.keys(item).join("")}
		<li>
			<slot {item}>
				{#if kind === "directory"}
					<button
						type="button"
						on:click={() => {
							if (show === path + "/" + key) {
								show = null
							} else {
								show = path + "/" + key
							}
						}}
						class="flex flex-row items-center justify-start w-full h-full text-sm whitespace-nowrap select-none focus:outline-none focus:bg-[hsl(240DEG,6%,9%)]"
					>
						<div class="flex items-center justify-center w-7 h-7 aspect-square">
							<img src={show === path + "/" + key ? _folder_open : _folder} alt="directory" class="block w-3.5 h-auto" />
						</div>
						<div>
							{key}
						</div>
					</button>
				{:else if kind === "file"}
					<button
						type="button"
						on:click={() => {
							if (open(path + "/" + key)) {
								$library.open = null
							} else {
								$library.open = path + "/" + key
							}
						}}
						class="flex flex-row items-center justify-start gap-1 w-full h-full text-sm whitespace-nowrap select-none focus:outline-none focus:bg-[hsl(240DEG,6%,9%)]"
					>
						<div class="flex items-center justify-center w-7 h-7 aspect-square">
							<img src={_file} alt="file" class="block w-2.5 h-auto" />
						</div>
						<div>
							{key}
						</div>
					</button>
				{/if}
			</slot>
			{#if kind !== "file" && show === path + "/" + key}
				<svelte:self data={item.directory} path={path + "/" + key} />
			{/if}
		</li>
	{/each}
</ul>
