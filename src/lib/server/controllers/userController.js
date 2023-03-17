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

export const updateUser = async (userId, updateData) => {
	return await User.findByIdAndUpdate(userId, updateData, { new: true })
}

export const deleteUser = async (userId) => {
	return await User.findByIdAndDelete(userId)
}
