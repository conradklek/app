import { CallbackManager } from "langchain/callbacks"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema"
import { OPENAI_API_KEY } from "$env/static/private"

export async function POST({ request }) {
	const { messages, prompt, controls } = await request.json()
	const system = new SystemChatMessage(controls?.system ?? "You are an AI assistant..")
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
	return new Response(
		new ReadableStream({
			async start(controller) {
				let stream = ""
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
							stream += token
							console.clear()
							console.log(stream)
						}
					})
				})
				await chat.call(_messages)
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
