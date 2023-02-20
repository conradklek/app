<script>
	export let data = {}
	export let path = ""
</script>

<ul>
	{#each Object.keys(data) as item (path + "/" + item)}
		{@const src = path + "/" + item}
		{@const dir = data[item].directory ? true : false}
		<li>
			<slot {item} {src} {dir}>No slot</slot>
			{#if data[item].directory}
				<svelte:self data={data[item].directory} path={src} let:item let:src let:dir>
					<slot {item} {src} {dir}>No slot</slot>
				</svelte:self>
			{/if}
		</li>
	{/each}
</ul>
