import { redirect } from "@sveltejs/kit"

export function load(event) {
	console.log()
	if (!event.locals.user && event.url.pathname !== "/") {
		throw redirect(302, "/")
	}
	return { user: event.locals.user }
}
