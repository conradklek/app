<script>
	import { onMount, onDestroy } from "svelte"
	export let menu = null
	function close(e) {
		menu = null
	}
	onMount(() => {
		console.log("mounted", menu)
		window.addEventListener("scroll", close)
		window.addEventListener("click", close)
		if (menu.x + 128 > window.innerWidth) {
			menu.x = window.innerWidth - 136
		}
		if (menu.y + 128 > window.innerHeight) {
			menu.y = window.innerHeight - 128
		}
	})
	onDestroy(() => {
		console.log("destroyed")
		window.removeEventListener("click", close)
		window.removeEventListener("scroll", close)
	})
</script>

<div id="menu" class="z-50 fixed inset-0 w-32 h-32 rounded-sm bg-blue-500/50 ring ring-blue-500/20 ring-offset-1 ring-offset-blue-500/50" style:top="{menu.y}px" style:left="{menu.x}px" />
