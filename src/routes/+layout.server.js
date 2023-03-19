import { redirect } from "@sveltejs/kit"

export function load(event) {
	if (!event.locals.user && event.url.pathname.startsWith("$")) {
		throw redirect(302, "/")
	}
	return { user: event.locals.user }
}
