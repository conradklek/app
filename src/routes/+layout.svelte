<script>
	import "../app.postcss"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	$: {
		if (browser) console.log($page.data)
	}
</script>

<slot />
