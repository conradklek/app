import { writable } from "svelte/store"

export async function read(wc, path) {
	const obj = {}
	const dir = await wc.fs.readdir(path, { withFileTypes: true })
	for (const item of dir) {
		if (item.name === "node_modules" || item.name.startsWith(".") || item.name === "pnpm-lock.yaml") continue
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

export async function load(handler, path = "", data = {}) {
	if (!handler) {
		handler = await window.showDirectoryPicker()
		return { [handler.name]: { directory: await load(handler, handler.name) } }
	}
	for await (const entry of handler.values()) {
		if (entry.kind === "directory") {
			data[entry.name] = {
				directory: await load(entry, `${path}/${entry.name}`, {})
			}
		} else if (entry.kind === "file") {
			const text = await entry.getFile().then((file) => file.text())
			data[entry.name] = {
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
		if (name === "node_modules" || name.startsWith(".") || name === "pnpm-lock.yaml") continue
		if (item.directory) {
			flat(item.directory, `${path}/${name}`, data)
			data.push([`${path}/${name}`, { directory: item.directory }])
		} else if (item.file) {
			data.push([`${path}/${name}`, { file: item.file.contents }])
		}
	}
	return data
}

export const webcontainer = writable(null)
