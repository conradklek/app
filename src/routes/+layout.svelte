<script>
	import "../app.postcss"
	import { Auth } from "$lib/client/components"
	import { page } from "$app/stores"
</script>

{#if $page.data.user !== null}
	<slot />
{:else}
	<Auth />
{/if}
