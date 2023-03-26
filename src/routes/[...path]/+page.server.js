import { redirect } from "@sveltejs/kit"
import { getUserByUsername } from "$lib/server/controllers/user"

export async function load({ params }) {
	let load = {}
	if (params.path?.length) {
		const user = await getUserByUsername(params.path.split("/")[0])
		if (!user) {
			throw redirect(303, "/")
		}
		load = user.data
		if (params.path.split("/").length > 1) {
			let path = params.path.split("/").slice(1)
			for (let i = 0; i < path.length; i++) {
				load = load[path[i]]?.directory || load[path[i]]?.file
			}
		}
	}
	return {
		path: params.path,
		load
	}
}
