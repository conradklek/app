<script>
	import "../app.postcss"
	import { Dialog } from "$lib/client/components"
	$: modal = false
</script>

<Dialog bind:modal />

<header />

<nav>
	<button type="button" on:click={() => (modal = true)}>open</button>
</nav>

<aside />

<main>
	<slot />
</main>

<footer />

<nav />
