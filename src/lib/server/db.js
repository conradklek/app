import mongoose from "mongoose"
import { MONGODB_URI } from "$env/static/private"

export const connectDB = async () => {
	try {
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		console.log("MongoDB connected")
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message)
	}
}
