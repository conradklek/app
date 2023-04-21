import { CallbackManager } from "langchain/callbacks"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema"
import { OPENAI_API_KEY } from "$env/static/private"

export async function POST({ request }) {
	const { messages, controls } = await request.json()
	const system = new SystemChatMessage(controls?.system ?? "You are an AI. Have fun. Use emojis where appropriate.")
	const { temperature, topP, frequencyPenalty, presencePenalty, maxTokens } = controls
	let _messages = [
		system,
		...messages.map((m) => {
			if (m.role === "user") {
				return new HumanChatMessage(m.content)
			} else {
				return new AIChatMessage(m.content)
			}
		})
	]
	console.log(_messages)
	return new Response(
		new ReadableStream({
			async start(controller) {
				const chat = new ChatOpenAI({
					temperature: temperature || 0.7,
					topP: topP || 1.0,
					frequencyPenalty: frequencyPenalty || 0,
					presencePenalty: presencePenalty || 0,
					maxTokens: maxTokens || 2048,
					modelName: "gpt-4",
					openAIApiKey: OPENAI_API_KEY,
					streaming: true,
					callbackManager: CallbackManager.fromHandlers({
						async handleLLMNewToken(token) {
							controller.enqueue(token)
						}
					})
				})
				const response = await chat.call(_messages)
				console.log(response)
				controller.close()
			}
		}),
		{
			headers: {
				"Content-Type": "text/event-stream"
			}
		}
	)
}
