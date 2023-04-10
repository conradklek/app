import { getUserByUsername, updateUser } from "$lib/server/controllers/user"
import { json } from "@sveltejs/kit"

export async function GET({ locals, request, params }) {
	const username = params.username
	const user = await getUserByUsername(username)
	if (!user) {
		return json({ status: 400, message: "User not found" })
	}
	console.log(user)
	return json({ status: 200, directory: Object.keys(user.data) })
}
