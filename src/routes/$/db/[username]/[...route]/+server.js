import { getUserByUsername, updateUser } from "$lib/server/controllers/user"
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

export async function GET({ locals, request, params, fetch }) {
	const username = params.username
	const user = await getUserByUsername(username)
	if (!user) {
		return json({ status: 400, message: "User not found" })
	}
	console.log(user)
	const path = params.route.split("/")
	const data = walk(user.data, path)
	if (!data) {
		return json({ status: 400, message: "File not found" })
	}
	let response = await fetch("/$/db/conradklek", {
		method: "GET"
	})
	console.log(await response.json())
	if (data.file) {
		return json({ status: 200, file: data.file })
	} else {
		return json({ status: 200, directory: Object.keys(data.directory) })
	}
}
