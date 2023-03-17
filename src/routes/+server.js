import { json } from "@sveltejs/kit"
import { createUser, getUserByEmail } from "$lib/server/controllers/userController"
import { createToken } from "$lib/server/session"

export async function POST({ cookies, request }) {
	const data = await request.formData()
	const action = data.get("action")
	const email = data.get("email")
	const username = data.get("username")
	const password = data.get("password")
	if (action === "signup") {
		try {
			const user = await createUser({ username, email, password })
			const token = createToken({ id: user._id, username: user.username })
			cookies.set("token", token)
			return json({
				status: 201,
				data: { token, user: { username: user.username, id: user._id, data: {} } }
			})
		} catch (error) {
			return json({
				status: 500,
				data: { message: error.message }
			})
		}
	} else if (action === "login") {
		try {
			const user = await getUserByEmail(email)
			if (!user) {
				return json({
					status: 401,
					data: { message: "Invalid email or password" }
				})
			}
			const isMatch = await user.comparePassword(password)
			if (!isMatch) {
				return json({
					status: 401,
					data: { message: "Invalid email or password" }
				})
			}
			const token = createToken({ id: user._id, username: user.username })
			cookies.set("token", token)
			return json({
				status: 200,
				data: { token, user: { username: user.username, id: user._id, data: user.data || {} } }
			})
		} catch (error) {
			return json({
				status: 500,
				data: { message: error.message }
			})
		}
	}
}
