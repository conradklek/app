<script>
	import { onMount, onDestroy, createEventDispatcher } from "svelte"
	import { minimalSetup, basicSetup, EditorView } from "codemirror"
	import { indentWithTab } from "@codemirror/commands"
	import { EditorState } from "@codemirror/state"
	import { keymap } from "@codemirror/view"
	import { markdown } from "@codemirror/lang-markdown"
	import { languages } from "@codemirror/language-data"

	export let type = "text"
	export let wrap = false
	export let mini = false
	export let tabs = false
	export let code = null
	export let file = ""
	let node = null

	const dispatch = createEventDispatcher()
	function create(extensions) {
		if (code) code.destroy()
		return (code = new EditorView({
			state: EditorState.create({
				doc: file,
				extensions: [
					...extensions,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) dispatch("update", update.state.doc.toString())
					})
				]
			}),
			parent: node
		}))
	}
	onMount(() => {
		let extensions = []
		if (mini) {
			extensions = [
				minimalSetup,
				EditorState.transactionFilter.of((update) => {
					if (update.newDoc.lines > 1) {
						dispatch("submit", update.state.doc.toString())
						create(extensions)
						code.focus()
						return []
					}
					return [update]
				})
			]
		} else {
			extensions = [basicSetup]
		}
		if (tabs) {
			extensions.push(keymap.of([indentWithTab]))
		}
		if (mini) {
			extensions.push(
				keymap.of([
					{
						key: "ArrowUp",
						run: () => {
							dispatch("up")
						}
					},
					{
						key: "ArrowDown",
						run: () => {
							dispatch("down")
						}
					}
				])
			)
		}
		if (wrap) {
			extensions.push(EditorView.lineWrapping)
		}
		if (type === "md") {
			//extensions.push(markdown({ codeLanguages: languages }))
			extensions.push(EditorView.lineWrapping)
		}
		create(extensions)
		code = code
	})
	onDestroy(() => {
		if (code) code.destroy()
		code = null
	})
</script>

<div class="code" bind:this={node} />
