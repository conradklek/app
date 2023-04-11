import { CallbackManager } from "langchain/callbacks"
import { LLMChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models"
import { SerpAPI, Calculator, Tool } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { BufferMemory } from "langchain/memory"
import { RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools"

export const actions = {
	ai: async ({ request }) => {
		const data = await request.formData()
		const prompt = data.get("prompt")
		const tools = [new RequestsGetTool(), new RequestsPostTool(), await AIPluginTool.fromPluginUrl("https://app-cklek.vercel.app/.well-known/ai-plugin.json")]
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
		console.log(result)
		return { response: result.output }
	}
}
