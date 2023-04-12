import { ChatOpenAI } from "langchain/chat_models"
import { ZapierToolKit, initializeAgentExecutor } from "langchain/agents"
import { ZapierNLAWrapper } from "langchain/tools"

export async function GET({ url }) {
	let query = url.searchParams
	let to = query.get("to")
	let subject = query.get("subject")
	let body = query.get("body")
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
		input: `To: ${to}\nSubject: ${subject}\n\n${body}`
	})
	return new Response(result.output, {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
