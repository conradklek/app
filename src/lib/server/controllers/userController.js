import { Types } from "mongoose"
import User from "$lib/server/models/User.js"

export const createUser = async (userData) => {
	const user = new User(userData)
	await user.save()
	return user
}

export const getUserById = async (userId) => {
	return await User.findById(userId)
}

export const getUserByEmail = async (email) => {
	return await User.findOne({ email })
}

export const getUserByUsername = async (username) => {
	return await User.findOne({ username })
}

export const updateUser = async (userId, updateData) => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error("Invalid user ID")
	}

	try {
		const updatedUser = await User.findByIdAndUpdate(userId, { $set: { data: updateData } }, { new: true, runValidators: true })

		if (!updatedUser) {
			throw new Error("User not found")
		}

		return updatedUser
	} catch (error) {
		throw new Error(`Error updating user: ${error.message}`)
	}
}

export const deleteUser = async (userId) => {
	return await User.findByIdAndDelete(userId)
}
