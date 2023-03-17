export const actions = {
	logout: async (event) => {
		event.cookies.delete("token")
		event.locals.user = null
	}
}
