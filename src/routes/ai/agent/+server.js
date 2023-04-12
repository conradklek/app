import { ChatOpenAI } from "langchain/chat_models"
import { Calculator } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { env } from "$env/dynamic/private"

export async function GET({ url }) {
	let query = url.searchParams
	let prompt = query.get("prompt")
	const tools = [new Calculator()]
	const agent = await initializeAgentExecutor(
		tools,
		new ChatOpenAI({
			temperature: 0,
			modelName: "gpt-4",
			openAIApiKey: env.OPENAI_API_KEY
		}),
		"chat-zero-shot-react-description",
		true
	)
	const result = await agent.call({
		input: prompt
	})
	return new Response(result, {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
