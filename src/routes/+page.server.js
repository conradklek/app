import { fail, redirect } from "@sveltejs/kit"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema"
import { SerpAPI, ZapierNLAWrapper, Calculator } from "langchain/tools"
import { MONGODB_API, OPENAI_API_KEY, SERPAPI_API_KEY, ZAPIER_NLA_API_KEY } from "$env/static/private"
import { CallbackManager } from "langchain/callbacks"
import { initializeAgentExecutor, ZapierToolKit } from "langchain/agents"

export async function load({ locals, fetch }) {
	const response = await fetch("https://data.mongodb-api.com/app/data-zfwhk/endpoint/data/v1/action/findOne", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			apiKey: MONGODB_API
		},
		body: JSON.stringify({
			dataSource: "Database",
			database: "test",
			collection: "users",
			filter: {
				username: "conradklek"
			}
		})
	})
	console.log(response)
	const { document } = await response.json()
	console.log(document)
	const { username, data } = document
	return {
		user: { data, username: "sudo" }
	}
}
/*
export async function load({ locals, fetch }) {
	if (locals.user) {
		const user = await getUserByUsername(locals.user.username)
		if (!user) {
			locals.user = null
		} else {
			locals.user.data = user.data
		}
	}
	return {
		user: locals.user
	}
}
export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData()
		const email = data.get("email")
		const password = data.get("password")
		const user = await getUserByEmail(email)
		if (!user) return fail(400, { email, missing: true })
		const isMatch = await user.comparePassword(password)
		if (!isMatch) return fail(400, { email, incorrect: true })
		const session = createSession({ id: user._id, username: user.username })
		cookies.set("session", session)
		throw redirect(303, "/")
	},
	logout: async (event) => {
		event.cookies.delete("session")
		event.locals.user = null
		throw redirect(303, "/")
	}
}
*/
