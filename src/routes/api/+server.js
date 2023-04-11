import { json } from "sveltejs/kit"
import { CallbackManager } from "langchain/callbacks"
import { ZapierToolKit, LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } from "langchain/agents"
import { LLMChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models"
import { BasePromptTemplate, SerializedBasePromptTemplate, renderTemplate, BaseChatPromptTemplate } from "langchain/prompts"
import { SerpAPI, Calculator, Tool } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { BufferMemory } from "langchain/memory"
import { RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools"

export async function POST({ request }) {
	const { prompt } = await request.json()
	console.log("data")
	const tools = [new Calculator()]
	let message = {
		role: "assistant",
		content: "",
		id: crypto.randomUUID()
	}
	const agent = await initializeAgentExecutor(
		tools,
		new ChatOpenAI({
			temperature: 0,
			modelName: "gpt-4",
			openAIApiKey: "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",
		}),
		"chat-zero-shot-react-description",
		true
	)
	const result = await agent.call({
		input: prompt
	})
	console.log(result)
	message.content = result
	return json(message)
}
