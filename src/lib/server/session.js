import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"

export const createSession = (payload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
}

export const verifySession = (session) => {
	try {
		return jwt.verify(session, JWT_SECRET)
	} catch (error) {
		return null
	}
}
