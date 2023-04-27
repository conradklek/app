import { CallbackManager } from "langchain/callbacks"
import { OPENAI_API_KEY } from "$env/static/private"
import { AutoGPT } from "langchain/experimental/autogpt"
import { ReadFileTool, WriteFileTool } from "langchain/tools"
import { InMemoryFileStore } from "langchain/stores/file/in_memory"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { ChatOpenAI } from "langchain/chat_models/openai"

export async function POST({ request }) {
	let { prompt } = await request.json()
	return new Response(
		new ReadableStream({
			async start(controller) {
				let store = new InMemoryFileStore()
				let tools = [new ReadFileTool({ store }), new WriteFileTool({ store })]
				let vectorStore = new MemoryVectorStore(
					new OpenAIEmbeddings({
						openAIApiKey: OPENAI_API_KEY
					})
				)
				let stream = ""
				let autogpt = AutoGPT.fromLLMAndTools(
					new ChatOpenAI({
						modelName: "gpt-4",
						temperature: 0,
						openAIApiKey: OPENAI_API_KEY,
						streaming: true,
						callbackManager: CallbackManager.fromHandlers({
							async handleLLMNewToken(token) {
								stream += token
								controller.enqueue(token)
							}
						})
					}),
					tools,
					{
						memory: vectorStore.asRetriever(),
						aiName: "ASI",
						aiRole: "Assistant"
					}
				)
				let response = await autogpt.run([prompt])
				console.log(response)
				console.log(stream)
			}
		}),
		{
			headers: {
				"Content-Type": "text/event-stream"
			}
		}
	)
}
