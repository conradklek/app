import { getUserById, updateUser } from "$lib/server/controllers/user"
import { json } from "@sveltejs/kit"

function walk(tree, path, data) {
	if (data) {
		if (path.length === 1) {
			if (typeof data === "string") {
				return (tree[path[0]].file.contents = data)
			} else {
				return (tree[path[0]].directory = data)
			}
		} else {
			return walk(tree[path[0]].directory, path.slice(1), data)
		}
	} else {
		if (path.length === 1) {
			return tree[path[0]]
		} else {
			return walk(tree[path[0]].directory, path.slice(1))
		}
	}
}

async function processCommand({ command, args, path, data, file, load, user }) {
	const error = (message) => json({ status: 400, message })
	if (file && command !== "echo") {
		return error("You are not in a directory")
	}
	const updateData = async (newData) => {
		await updateUser(user._id, newData)
		return json({ status: 200, type: "redirect", location: "/" + path.join("/") })
	}
	switch (command) {
		case "rm":
			return await removeItem({ args, path, data, user, updateData, error })
		case "touch":
			return await createFile({ args, path, data, user, updateData, error })
		case "mkdir":
			return await createDirectory({ args, path, data, user, updateData, error })
		case "echo":
			return await writeFileContents({ path, file, user, updateData, error })
		case "mv":
			return await moveItem({ args, path, data, user, updateData, error })
		case "load":
			return await loadData({ path, data, load, user, updateData, error })
		case "cd":
			return await changeDirectory({ args, path, data, user, updateData, error })
		default:
			return error("Invalid command")
	}
}

export async function POST({ locals, request }) {
	if (!locals.user?.id) {
		return json({ status: 400, message: "Unauthorized" })
	}
	const form = await request.formData()
	const { code, path, file, data, load } = extractFormInputs(form)
	if (path[0] !== locals.user?.username) {
		return json({ status: 400, message: "Unauthorized" })
	}
	const user = await getUserById(locals.user.id)
	const [command, ...args] = code
		.trim()
		.split(" ")
		.filter((arg) => arg !== "")
	console.clear()
	console.log({ code, path, file, data, load })
	return await processCommand({ command, args, path, data, file, load, user })
}

function extractFormInputs(form) {
	return {
		code: form.get("code"),
		path: form.get("path").split("/"),
		file: form.get("file"),
		data: JSON.parse(form.get("data")),
		load: form.get("load") ? JSON.parse(form.get("load")) : null
	}
}
async function removeItem({ args, path, data, user, updateData, error }) {
	if (args.length !== 1) {
		return error("You must specify a file or directory to remove")
	}
	const item = args[0]
	if (!data[item]) {
		return error("The file or directory does not exist")
	}
	if (path.length === 1) {
		delete user.data[item]
	} else {
		delete data[item]
		walk(user.data, path.slice(1), data)
	}
	return await updateData(user.data)
}

async function createFile({ args, path, data, user, updateData, error }) {
	const file = args[0]
	if (data[file]) {
		return error("The file already exists")
	}
	const newFile = { file: { contents: "" } }
	if (path.length === 1) {
		user.data[file] = newFile
	} else {
		data[file] = newFile
		walk(user.data, path.slice(1), data)
	}
	return await updateData(user.data)
}

async function createDirectory({ args, path, data, user, updateData, error }) {
	const dir = args[0]
	if (data[dir]) {
		return error("The directory already exists")
	}
	const newDir = { directory: {} }
	if (path.length === 1) {
		user.data[dir] = newDir
	} else {
		data[dir] = newDir
		walk(user.data, path.slice(1), data)
	}
	return await updateData(user.data)
}

async function writeFileContents({ path, file, user, updateData, error }) {
	if (!file) {
		return error("You are not in a file")
	}
	walk(user.data, path.slice(1), file)
	return await updateData(user.data)
}

async function moveItem({ args, path, data, user, updateData, error }) {
	const [src, dest] = args
	if (!data[src]) {
		return error("The source file or directory does not exist")
	}
	if (path.length === 1) {
		user.data[dest] = user.data[src]
		delete user.data[src]
	} else {
		data[dest] = data[src]
		delete data[src]
		walk(user.data, path.slice(1), data)
	}
	return await updateData(user.data)
}

async function loadData({ path, data, load, user, updateData, error }) {
	const mergedData = { ...data, ...load }
	if (path.length === 1) {
		user.data = mergedData
	} else {
		walk(user.data, path.slice(1), mergedData)
	}
	return await updateData(user.data)
}

async function changeDirectory({ args, path, data, user, updateData, error }) {
	if (args.length !== 1) {
		return error("You must specify a directory to change to")
	}
	const targetDir = args[0]
	if (targetDir === "../") {
		if (path.length > 1) {
			const newPath = path.slice(0, -1).join("/")
			return json({ status: 200, type: "redirect", location: "/" + newPath })
		} else {
			return error("Cannot move up from the root directory")
		}
	} else if (targetDir === "~") {
		const newPath = [user.username].join("/")
		return json({ status: 200, type: "redirect", location: "/" + newPath })
	}
	const newPath = path.concat(targetDir).join("/")
	return json({ status: 200, type: "redirect", location: "/" + newPath })
}
