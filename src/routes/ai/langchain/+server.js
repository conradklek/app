import { ChatOpenAI } from "langchain/chat_models"
import { initializeAgentExecutor } from "langchain/agents"
import { Calculator } from "langchain/tools"
import { OPENAI_API_KEY } from "$env/static/private"
import { CallbackManager } from "langchain/callbacks"

export const POST = async ({ request }) => {
	const { prompt } = await request.json()
	return new Response(
		new ReadableStream({
			async start(controller) {
				let model = new ChatOpenAI({
					openAIApiKey: OPENAI_API_KEY,
					temperature: 0,
					modelName: "gpt-4",
					streaming: true,
					callbackManager: CallbackManager.fromHandlers({
						async handleLLMNewToken(token) {
							controller.enqueue(token)
						}
					})
				})
				let tools = [new Calculator()]
				const executor = await initializeAgentExecutor(tools, model, "chat-zero-shot-react-description")
				await executor.call({ input: prompt })
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
