import { ChatOpenAI } from "langchain/chat_models"
import { SerpAPI, Calculator } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"

export async function GET({ url }) {
	let query = url.searchParams
	let prompt = query.get("prompt")
	const tools = [new Calculator(), new SerpAPI("e9f7baffc4a6705e8884aadc585ee8bd3c08521b70ce961896fa6d3418cc710c")]
	const agent = await initializeAgentExecutor(
		tools,
		new ChatOpenAI({
			temperature: 0,
			modelName: "gpt-4",
			openAIApiKey: "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"
		}),
		"chat-zero-shot-react-description",
		true
	)
	const result = await agent.call({
		input: prompt
	})
	return new Response(result.output, {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
