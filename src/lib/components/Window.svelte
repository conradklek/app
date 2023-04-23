<script>
	export let host
	$: winW = 0
	$: winH = 0
	$: size = false
	$: rect = { top: 0, left: 0, width: 288, height: 288 }
</script>

<svelte:window
	bind:innerWidth={winW}
	bind:innerHeight={winH}
	on:mouseup={() => {
		if (size) size = false
	}}
	on:mousemove={(e) => {
		if (size) {
			console.log(e)
			switch (size) {
				case "l":
					rect.width -= e.movementX
					rect.left += e.movementX / 2
					break
				case "r":
					rect.width += e.movementX
					rect.left += e.movementX / 2
					break
				case "tl":
					rect.width -= e.movementX
					rect.height -= e.movementY
					rect.left += e.movementX / 2
					rect.top += e.movementY / 2
					break
				case "t":
					rect.left += e.movementX
					rect.top += e.movementY
					break
				case "tr":
					rect.width += e.movementX
					rect.height -= e.movementY
					rect.left += e.movementX / 2
					rect.top += e.movementY / 2
					break
				case "bl":
					rect.width -= e.movementX
					rect.height += e.movementY
					rect.left += e.movementX / 2
					rect.top += e.movementY / 2
					break
				case "b":
					rect.height += e.movementY
					rect.top += e.movementY / 2
					break
				case "br":
					rect.width += e.movementX
					rect.height += e.movementY
					rect.left += e.movementX / 2
					rect.top += e.movementY / 2
					break
				default:
					break
			}
		}
	}}
/>

<div class="z-[100] fixed inset-auto grid place-items-center w-72 h-72 rounded-sm transform-gpu will-change-transform" style:transform="translate({rect.left}px, {rect.top}px)" style:width="{rect.width}px" style:height="{rect.height}px">
	<main class="grid place-items-center w-full h-full rounded-sm">
		{#each ["tl", "t", "tr", "l", "r", "bl", "b", "br"] as corner}
			<div class="{corner}-corner z-20 absolute cursor-grab active:cursor-grabbing" draggable={true} on:dragstart|preventDefault={() => (size = corner)} />
		{/each}
		<div class="z-10 relative grid place-items-center w-full h-full rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50">
			{#if host}
				<iframe src={host} title="host" class="w-full h-full rounded-sm" />
			{/if}
		</div>
	</main>
</div>

<style lang="css/tailwindcss">
	.tl-corner {
		@apply w-5 h-5 top-0 left-0 rounded-tl-sm;
	}
	.t-corner {
		@apply w-[calc(100%-2.5rem)] h-5 top-0 left-5;
	}
	.tr-corner {
		@apply w-5 h-5 top-0 right-0 rounded-tr-sm;
	}
	.l-corner {
		@apply w-5 h-[calc(100%-2.5rem)] top-5 left-0;
	}
	.r-corner {
		@apply w-5 h-[calc(100%-2.5rem)] top-5 right-0;
	}
	.bl-corner {
		@apply w-5 h-5 bottom-0 left-0 rounded-bl-sm;
	}
	.b-corner {
		@apply w-[calc(100%-2.5rem)] h-5 bottom-0 right-5;
	}
	.br-corner {
		@apply w-5 h-5 bottom-0 right-0 rounded-br-sm;
	}
</style>
