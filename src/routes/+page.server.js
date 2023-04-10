import { fail, redirect } from "@sveltejs/kit"
import { createSession } from "$lib/server/session"
import { getUserByEmail, getUserByUsername } from "$lib/server/controllers/user"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema"
import { SerpAPI, ZapierNLAWrapper, Calculator } from "langchain/tools"
import { OPENAI_API_KEY, SERPAPI_API_KEY, ZAPIER_NLA_API_KEY } from "$env/static/private"
import { CallbackManager } from "langchain/callbacks"
import { initializeAgentExecutor, ZapierToolKit } from "langchain/agents"

export async function load({ locals }) {
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
	},
	ai: async (event) => {
		console.log(event)
		return new Response(
			new ReadableStream({
				async start(controller) {
					let text = ""
					chat = new ChatOpenAI({
						temperature: 0.4,
						modelName: "gpt-4",
						openAIApiKey: OPENAI_API_KEY,
						streaming: true,
						callbackManager: CallbackManager.fromHandlers({
							async handleLLMNewToken(token) {
								text += token
								controller.enqueue(token)
								console.clear()
								console.log(text)
							}
						})
					})
					response = await chat.call("Hello, friend")
				}
			}),
			{
				headers: {
					"Content-Type": "text/event-stream"
				}
			}
		)
	}
}
