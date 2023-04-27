import { CallbackManager } from "langchain/callbacks"
import { OPENAI_API_KEY } from "$env/static/private"
import { BabyAGI } from "langchain/experimental/babyagi"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"
import { LLMChain } from "langchain/chains"
import { ChainTool } from "langchain/tools"
import { initializeAgentExecutorWithOptions } from "langchain/agents"

export async function POST({ request }) {
	let { prompt } = await request.json()
	return new Response(
		new ReadableStream({
			async start(controller) {
				// First, we create a custom agent which will serve as execution chain.
				const todoPrompt = PromptTemplate.fromTemplate("You are a planner who is an expert at coming up with a todo list for a given objective. Come up with a todo list for this objective: {objective}")
				const tools = [
					new ChainTool({
						name: "TODO",
						chain: new LLMChain({
							llm: new OpenAI({
								temperature: 0,
								modelName: "gpt-4",
								temperature: 0,
								openAIApiKey: OPENAI_API_KEY
							}),
							prompt: todoPrompt
						}),
						description: "useful for when you need to come up with todo lists. Input: an objective to create a todo list for. Output: a todo list for that objective. Please be very clear what the objective is!"
					})
				]
				const agentExecutor = await initializeAgentExecutorWithOptions(
					tools,
					new OpenAI({
						temperature: 0,
						modelName: "gpt-4",
						temperature: 0,
						openAIApiKey: OPENAI_API_KEY
					}),
					{
						agentType: "zero-shot-react-description",
						agentArgs: {
							prefix: `You are an AI who performs one task based on the following objective: {objective}. Take into account these previously completed tasks: {context}.`,
							suffix: `Question: {task}\n{agent_scratchpad}`,
							inputVariables: ["objective", "task", "context", "agent_scratchpad"]
						}
					}
				)
				const vectorStore = new MemoryVectorStore(
					new OpenAIEmbeddings({
						openAIApiKey: OPENAI_API_KEY
					})
				)
				const babyAGI = BabyAGI.fromLLM({
					llm: new OpenAI({
						modelName: "gpt-4",
						temperature: 0,
						openAIApiKey: OPENAI_API_KEY,
						streaming: true,
						callbackManager: CallbackManager.fromHandlers({
							async handleLLMNewToken(token) {
								controller.enqueue(token)
							}
						})
					}),
					executionChain: agentExecutor, // an agent executor is a chain
					vectorstore: vectorStore,
					maxIterations: 10
				})
				await babyAGI.call({ objective: prompt })
			}
		}),
		{
			headers: {
				"Content-Type": "text/event-stream"
			}
		}
	)
}
