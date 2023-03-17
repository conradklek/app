import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"

export const createToken = (payload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
}

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET)
	} catch (error) {
		return null
	}
}
