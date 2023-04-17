import { ChatOpenAI } from "langchain/chat_models"
import { initializeAgentExecutor } from "langchain/agents"
import { Calculator } from "langchain/tools"
import { OPENAI_API_KEY } from "$env/static/private"
import { CallbackManager } from "langchain/callbacks"

export const POST = async ({ request }) => {
	const { prompt } = await request.json()
	console.log("prompt", prompt)
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
				console.log("Loaded agent.")
				const result = await executor.call({ input: prompt })
				console.log(`Got output ${result.output}`)
				console.log(`Got intermediate steps ${JSON.stringify(result.intermediateSteps, null, 2)}`)
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
