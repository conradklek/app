<script>
	import { onMount, onDestroy, createEventDispatcher } from "svelte"
	import { minimalSetup, basicSetup, EditorView } from "codemirror"
	import { indentWithTab } from "@codemirror/commands"
	import { EditorState, Compartment } from "@codemirror/state"
	import { keymap } from "@codemirror/view"
	import { markdown } from "@codemirror/lang-markdown"
	export let type = "text"
	export let mini = false
	export let tabs = false
	export let code = null
	export let file = ""
	let node = null
	let lang = new Compartment()
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
		if (!mini && tabs) {
			extensions.push(keymap.of([indentWithTab]))
		}
		if (type === "md") {
			extensions.push(lang.of(markdown()))
		}
		create(extensions)
	})
	onDestroy(() => {
		if (code) code.destroy()
	})
</script>

<div class="code" bind:this={node} />
