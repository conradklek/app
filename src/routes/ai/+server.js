import { CallbackManager } from "langchain/callbacks"
import { LLMChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models"
import { SerpAPI, Calculator, Tool } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools"
import { env } from "$env/dynamic/private"

export async function POST({ request }) {
	const data = await request.json()
	const prompt = data.prompt
	const tools = [ new RequestsGetTool(), new RequestsPostTool(), await AIPluginTool.fromPluginUrl("https://app-cklek.vercel.app/.well-known/ai-plugin.json")]
	return new Response(
		new ReadableStream({
			async start(controller) {
				let stream = ""
				const agent = await initializeAgentExecutor(
					tools,
					new ChatOpenAI({
						temperature: 0,
						modelName: "gpt-4",
						openAIApiKey: env.OPENAI_API_KEY,
						streaming: true,
						callbackManager: CallbackManager.fromHandlers({
							async handleLLMNewToken(token) {
								console.clear()
								stream += token
								console.log(stream)
								controller.enqueue(token)
							}
						})
					}),
					"chat-zero-shot-react-description",
					true
				)
				const result = await agent.call({
					input: prompt
				})
				console.log(result)
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
