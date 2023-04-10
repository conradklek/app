<script>
	import { lib } from "$lib/client/stores"
	import { _file, _folder, _folder_open } from "$lib/assets/svg"
	export let data = {}
	export let path = ""
	$: keys = Object.keys(data)
	$: open = (key) => ($lib.open?.path === key ? true : false)
	$: show = false
</script>

<ul class="m-1.5 p-2.5 bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 rounded-sm">
	{#each keys as key (path + "/" + key)}
		{@const item = data[key]}
		{@const kind = Object.keys(item).join("")}
		<li>
			<slot {item}>
				{#if kind === "directory"}
					<button type="button" on:click={() => (show = !show)} class="flex flex-row items-center justify-start gap-1 whitespace-nowrap select-none focus:outline-none" class:text-white={show}>
						<div class="flex items-center justify-center w-7 h-7">
							<img src={show ? _folder_open : _folder} alt="directory" class="block w-4 h-auto" />
						</div>
						{key}
					</button>
				{:else if kind === "file"}
					<button type="button" on:click={() => ($lib.open = $lib.open?.path === path + "/" + key ? null : { path: path + "/" + key, item })} class="flex flex-row items-center justify-start gap-1 whitespace-nowrap select-none focus:outline-none" class:text-white={open(path + "/" + key)}>
						<div class="flex items-center justify-center w-7 h-7">
							<img src={_file} alt="file" class="block w-2.5 h-auto" />
						</div>
						{key}
					</button>
				{/if}
			</slot>
			{#if kind !== "file" && show}
				<svelte:self data={item.directory} path={path + "/" + key} />
			{/if}
		</li>
	{/each}
</ul>
