import { fail, redirect } from "@sveltejs/kit"
import { createSession } from "$lib/server/session"
import { getUserByEmail, getUserByUsername } from "$lib/server/controllers/user"

export async function load({ locals }) {
	if (locals.user) {
		const user = await getUserByUsername(locals.user.username)
		if (!user) {
			locals.user = null
		} else {
			locals.user.data = user.data
		}
	}
	return {
		user: locals.user
	}
}

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData()
		const email = data.get("email")
		const password = data.get("password")
		const user = await getUserByEmail(email)
		if (!user) return fail(400, { email, missing: true })
		const isMatch = await user.comparePassword(password)
		if (!isMatch) return fail(400, { email, incorrect: true })
		const session = createSession({ id: user._id, username: user.username })
		cookies.set("session", session)
		throw redirect(303, "/")
	},
	logout: async (event) => {
		event.cookies.delete("session")
		event.locals.user = null
		throw redirect(303, "/")
	}
}
