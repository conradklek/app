import { getUserByUsername } from "$lib/server/controllers/userController"

export async function load({ params }) {
	const name = params.path.split("/")[0]
	const user = await getUserByUsername(name)
	return { path: params.path, load: user.data || {} }
}
