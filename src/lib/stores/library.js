import { writable } from "svelte/store"

export async function read(wc, path) {
	const obj = {}
	const dir = await wc.fs.readdir(path, { withFileTypes: true })
	for (const item of dir) {
		if (item.isDirectory()) {
			obj[item.name] = { directory: await read(wc, `${path}/${item.name}`) }
		} else if (item.isFile()) {
			obj[item.name] = {
				file: {
					contents: await wc.fs.readFile(`${path}/${item.name}`, "utf8")
				}
			}
		}
	}
	return obj
}

export async function load_directory(handler, path = "", data = {}) {
	if (!handler) {
		handler = await window.showDirectoryPicker()
		return { [handler.name]: { directory: await load_directory(handler, handler.name) } }
	}
	for await (const item of handler.values()) {
		if (item.name.startsWith(".")) continue
		if (item.kind === "directory") {
			data[item.name] = {
				directory: await load_directory(item, `${path}/${item.name}`, {})
			}
		} else if (item.kind === "file") {
			const text = await item.getFile().then((file) => file.text())
			data[item.name] = {
				file: {
					contents: text
				}
			}
		}
	}
	return data
}

export function flat(tree, path = "", data = []) {
	for (const [name, item] of Object.entries(tree)) {
		if (item.directory) {
			flat(item.directory, `${path}/${name}`, data)
			data.push([`${path}/${name}`, { directory: item.directory }])
		} else if (item.file) {
			data.push([`${path}/${name}`, { file: item.file.contents }])
		}
	}
	return data
}

export const library = writable({
	wc: null,
	open: null,
	data: null,
	host: null
})
