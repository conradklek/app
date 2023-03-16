<script>
	import { webcontainer } from "$lib/client/stores/webcontainer"
	async function init() {
		$webcontainer.terminal.input.write("cd " + $webcontainer.root + "\r")
	}
	$: {
		init()
	}
</script>
