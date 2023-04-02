import { redirect } from "@sveltejs/kit"
import { getUserByUsername } from "$lib/server/controllers/user"

export async function load({ locals, params }) {
	let load = {}
	if (!locals.user?.username) {
		throw redirect(303, "/")
	}
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
	if (!locals.user?.data) {
		const user = await getUserByUsername(locals.user.username)
		locals.user.data = user.data
	}
	return {
		path: params.path,
		user: locals.user,
		load
	}
}

export const actions = {
	pwd: async ({ params }) => {
		return {
			path: params.path
		}
	}
}
