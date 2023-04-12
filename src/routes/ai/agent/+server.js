import { ChatOpenAI } from "langchain/chat_models"
import { ZapierToolKit, initializeAgentExecutor } from "langchain/agents"
import { ZapierNLAWrapper } from "langchain/tools"

export async function GET({ url }) {
	let query = url.searchParams
	let prompt = query.get("prompt")
	const zapier = new ZapierNLAWrapper({
		apiKey: "sk-ak-3uMtywSqE9rkkjcLCCzydtYCnO"
	})
	const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier)
	const tools = toolkit.tools
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
