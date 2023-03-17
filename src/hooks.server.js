import { connectDB } from "$lib/server/db.js"
import { verifyToken } from "$lib/server/session.js"

connectDB()

export async function handle({ event, resolve }) {
	const token = event.cookies.get("token") || null
	const user = token ? verifyToken(token) : null
	event.locals.user = user
	const response = await resolve(event)
	response.headers.set("authorization", token)
	return response
}

export function getSession({ event }) {
	const { user } = event.locals
	return {
		user
	}
}
