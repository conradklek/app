<script>
	import { onMount, onDestroy, createEventDispatcher } from "svelte"
	import { languages } from "@codemirror/language-data"
	import { markdown } from "@codemirror/lang-markdown"
	import { javascript } from "@codemirror/lang-javascript"
	import { html } from "@codemirror/lang-html"
	import { css } from "@codemirror/lang-css"
	import { json } from "@codemirror/lang-json"
	import { basicSetup, EditorView } from "codemirror"
	import { indentWithTab } from "@codemirror/commands"
	import { EditorState } from "@codemirror/state"
	import { keymap } from "@codemirror/view"
	export let code = null
	export let file = ""
	export let type
	let node

	const dispatch = createEventDispatcher()

	onMount(async () => {
		code = new EditorView({
			state: EditorState.create({
				doc: file,
				extensions: [
					basicSetup,
					keymap.of([indentWithTab]),
					type === "md" ? markdown({ codeLanguages: languages }) : type === "js" ? javascript() : type === "html" || type === "svelte" ? html() : type === "css" ? css() : json(),
					EditorView.lineWrapping,
					EditorView.updateListener.of(async (update) => {
						if (update.docChanged) {
							dispatch("update", update.state.doc.toString())
						}
					})
				]
			}),
			parent: node
		})
	})
	onDestroy(() => {
		if (code) code.destroy()
		code = null
	})
</script>

<div bind:this={node} class="relative z-10 min-h-[calc(100vh-15rem)]" />
