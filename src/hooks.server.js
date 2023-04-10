/*
import { verifySession } from "$lib/server/session"
import { connectDB } from "$lib/server/db"

connectDB()

export async function handle({ event, resolve }) {
	const session = event.cookies.get("session") || null
	const user = session ? verifySession(session) : null
	if (!user) {
		event.cookies.delete("session")
	}
	event.locals.user = user
	const response = await resolve(event)
	response.headers.set("authorization", session)
	return response
}
*/
