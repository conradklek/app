import { json } from "@sveltejs/kit"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema"
import { SerpAPI, ZapierNLAWrapper, Calculator } from "langchain/tools"
import { OPENAI_API_KEY, SERPAPI_API_KEY, ZAPIER_NLA_API_KEY } from "$env/static/private"
import { updateUser, getUserByUsername } from "$lib/server/controllers/user"
import { CallbackManager } from "langchain/callbacks"
import { initializeAgentExecutor, ZapierToolKit } from "langchain/agents"

export async function POST({ request, locals }) {
	if (!locals.user?.username) {
		return json({ status: 400, message: "Unauthorized" })
	}
	let data = await request.json()
	let { messages, controls, agent } = data
	let user = await getUserByUsername(locals.user.username)
	let { temperature = 0.7, topP = 1, frequencyPenalty = 0, presencePenalty = 0 } = controls
	return new Response(
		new ReadableStream({
			async start(controller) {
				let text = ""
				let chat = new ChatOpenAI({
					temperature,
					topP,
					frequencyPenalty,
					presencePenalty,
					modelName: "gpt-4",
					openAIApiKey: OPENAI_API_KEY,
					streaming: true,
					callbackManager: CallbackManager.fromHandlers({
						async handleLLMNewToken(token) {
							controller.enqueue(token)
							text += token
							console.clear()
							console.log(text)
						}
					})
				})
				let systemMessage = controls?.system || "You are an AI assistant."
				let response = await chat.call([new SystemChatMessage(systemMessage), ...messages.map((message) => (message.role === "user" ? new HumanChatMessage(message.content) : new AIChatMessage(message.content)))])
				messages.push({ role: "assistant", content: response.text, id: crypto.randomUUID(), date: new Date().toISOString() })
				user.data[agent].file.contents = JSON.stringify({ controls, messages })
				await updateUser(user._id, user.data)
				console.clear()
				console.log(messages)
				controller.close()
				ac.abort()
			},
			cancel() {
				ac.abort()
			}
		}),
		{
			headers: {
				"Content-Type": "text/event-stream"
			}
		}
	)
}
