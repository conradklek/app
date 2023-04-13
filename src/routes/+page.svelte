<script>
	import "../app.postcss"
	import { Application } from "@splinetool/runtime"
	import { onMount } from "svelte"
	import { tweened } from "svelte/motion"
	import * as ease from "svelte/easing"
	$: loading = tweened(0, {
		duration: 3000,
		easing: ease.quintInOut
	})
	let canvas
	let loader
	$: scroll = tweened(0, {
		duration: 2000,
		easing: ease.quadInOut
	})
	let side = null
	$: innerHeight = 0
	$: innerWidth = 0
	onMount(() => {
		const app = new Application(canvas)
		app.load("https://prod.spline.design/W8fEdZd6-nP0KOnt/scene.splinecode").then(() => {
			setTimeout(() => {
				loading.set(100)
			}, 1000)
			setTimeout(() => {
				loader = true
			}, 4000)
		})
	})
	$: {
		console.clear()
		console.log(innerWidth, innerHeight)
		console.log($loading)
		console.log($scroll)
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="w-screen h-screen z-50 fixed top-0 left-0 overflow-hidden grid place-items-center bg-black transition-transform will-change-transform transform-gpu duration-1000" class:-translate-y-[100vh]={loader}>
	<div class="w-full max-w-sm mx-auto px-4 flex flex-col items-start justify-start">
		<div class="w-full mx-auto mb-1 tabular-nums text-right">
			{Math.floor($loading)}%
		</div>
		<div class="w-full h-1 mx-auto bg-white/5">
			<div class="h-full bg-white" style={`width: ${$loading}%`} />
		</div>
	</div>
</div>

<div class="w-screen h-screen z-0 fixed top-0 left-0 overflow-hidden grid place-items-center pointer-events-none transition-all will-change-transform transform-gpu duration-[3s]" class:opacity-0={$scroll} class:-translate-y-[100vh]={$scroll}>
	<canvas bind:this={canvas} />
</div>

<div class="relative z-40 h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-blue-500/50" class:overflow-y-hidden={side === "right"}>
	<header class="z-50 sticky top-0 left-0 shrink-0 bg-blue-500/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<a href="/" class="h-8 w-8 rounded-full focus:outline-none bg-blue-500/50">
				<span class="sr-only">Home</span>
			</a>
			<div class="flex items-center gap-x-4 ml-auto">
				<button type="button" class="block lg:hidden h-8 w-8 rounded-full cursor-pointer bg-blue-500/50" on:click={() => (side = side === "left" ? null : "left")} />
				<button type="button" class="block xl:hidden h-8 w-8 rounded-full cursor-pointer bg-blue-500/50" on:click={() => (side = side === "right" ? null : "right")} />
			</div>
		</div>
	</header>
	<div class="relative z-0 mx-auto flex w-full h-[calc(100vh-4rem)] max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8 overflow-hidden">
		<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-blue-500/50" class:hidden={side !== "left"} />
		<main
			class="z-0 relative flex-1 h-[calc(100vh-4rem)] overflow-hidden bg-blue-500/50"
			on:wheel={() => {
				if (!$scroll) {
					scroll.set(100)
				}
			}}
		>
			<div class="relative z-10 w-full h-[calc(100vh-4rem)] translate-y-full bg-blue-500/50 border-8 border-blue-500/50 transition-transform will-change-transform transform-gpu duration-1000 delay-[1.5s]" class:translate-y-0={$scroll > 0} />
		</main>
		<aside class="w-screen sm:w-60 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:block overflow-x-hidden overflow-y-auto bg-blue-500/50" class:hidden={side !== "right"} />
	</div>
</div>
