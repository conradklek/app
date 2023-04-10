import { json } from "@sveltejs/kit"
import { OPENAI_API_KEY, SERPAPI_API_KEY, ZAPIER_NLA_API_KEY } from "$env/static/private"
import { CallbackManager } from "langchain/callbacks"
import { ZapierToolKit, LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } from "langchain/agents"
import { LLMChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models"
import { BasePromptTemplate, SerializedBasePromptTemplate, renderTemplate, BaseChatPromptTemplate } from "langchain/prompts"
import { InputValues, PartialValues, AgentStep, AgentAction, AgentFinish, BaseChatMessage, HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema"
import { SerpAPI, Calculator, Tool } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { BufferMemory } from "langchain/memory"
import { RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools"
/*
export const POST = async () => {
	const model = new ChatOpenAI({ temperature: 0, modelName: "gpt-4", openAIApiKey: OPENAI_API_KEY })
	const tools = [new SerpAPI(SERPAPI_API_KEY), new Calculator()]
	const executor = await initializeAgentExecutor(tools, model, "chat-conversational-react-description", true)
	executor.memory = new BufferMemory({
		returnMessages: true,
		memoryKey: "chat_history",
		inputKey: "input"
	})
	console.log("Loaded agent.")

	const input0 = "hi, i am bob"

	const result0 = await executor.call({ input: input0 })

	console.log(`Got output ${result0.output}`)

	const input1 = "whats my name?"

	const result1 = await executor.call({ input: input1 })

	console.log(`Got output ${result1.output}`)

	const input2 = "whats the weather in pomfret?"

	const result2 = await executor.call({ input: input2 })

	console.log(`Got output ${result2.output}`)

	return json({ status: 200, message: "OK" })
}
*/

export async function POST({ request, locals }) {
	if (!locals.user?.username) {
		return json({ status: 400, message: "Unauthorized" })
	}
	let data = await request.json()
	let { prompt, messages } = data
	if (prompt?.length) {
		let systemMessage = "You are an AI assistant. Continue the conversation with the user."
		let chatMessages = [new SystemChatMessage(systemMessage), ...messages.map((message) => (message.role === "user" ? new HumanChatMessage(message.content) : new AIChatMessage(message.content)))]
		return new Response(
			new ReadableStream({
				async start(controller) {
					let text = ""
					let chat = new ChatOpenAI({
						temperature: 0,
						modelName: "gpt-4",
						openAIApiKey: OPENAI_API_KEY
					})
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
					response = await chat.call(chatMessages)
					/*
					const tools = [new RequestsGetTool(), new RequestsPostTool(), await AIPluginTool.fromPluginUrl("https://app-cklek.vercel.app/api.json/.well-known/ai-plugin.json")]
					const agent = await initializeAgentExecutor(tools, new ChatOpenAI({ temperature: 0 }), "chat-zero-shot-react-description", true)

					const result = await agent.call({
						input: "What are the files located the directory '/$/db/conradklek/library'?"
					})

					console.log({ result })
					controller.enqueue(result)
					*/
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
	return json({ status: 400, message: "Invalid request" })
}
