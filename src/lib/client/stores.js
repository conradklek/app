import { writable } from "svelte/store"

export const app = writable({
	messages: [],
	agent: null,
	tools: [],
	open: null,
	side: null,
	root: null
})

export const lib = writable({
	terminal: null,
	writer: null,
	init: null,
	open: null,
	code: null,
	host: null,
	data: null
})
