<script>
	import { onMount, createEventDispatcher } from "svelte"
	import { basicSetup, EditorView } from "codemirror"
	import { EditorState } from "@codemirror/state"
	export let file
	const dispatch = createEventDispatcher()
	onMount(() => {
		new EditorView({
			state: EditorState.create({
				doc: file,
				extensions: [
					basicSetup,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) dispatch("update", update.state.doc.toString())
					})
				]
			}),
			parent: document.getElementById("editor")
		})
	})
</script>

<div id="editor" />
