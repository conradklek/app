<script>
	import { browser } from "$app/environment"
	import { onMount, onDestroy, createEventDispatcher } from "svelte"
	export let menu = null
	function close(e) {
		if (e.target.closest("#menu")) return
		menu = null
	}
	$: {
		if (browser) {
			window.addEventListener("click", close)
			if (menu.x + 128 > window.innerWidth) {
				menu.x = window.innerWidth - 128
			}
			if (menu.y + 128 > window.innerHeight) {
				menu.y = window.innerHeight - 128
			}
		}
	}
	onMount(() => {
		console.log("mounted", menu)
	})
	onDestroy(() => {
		console.log("destroyed")
		window.removeEventListener("click", close)
	})
</script>

<div id="menu" class="z-50 fixed inset-0 w-32 h-32 rounded-sm bg-blue-500/50" style:top="{menu.y}px" style:left="{menu.x}px" />
