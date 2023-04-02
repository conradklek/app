import { json } from "@sveltejs/kit"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"
import { OpenAI } from "langchain"
import { initializeAgentExecutor } from "langchain/agents"
import { SerpAPI, Calculator } from "langchain/tools"
import { OPENAI_API_KEY, SERPAPI_API_KEY } from "$env/static/private"

export async function POST({ locals, request }) {
	if (!locals.user?.id) {
		return json({ status: 400, message: "Unauthorized" })
	}
	let data = await request.json()
	console.log(data)
	let chat = new ChatOpenAI({ temperature: data.controls.temperature || 0.7, modelName: "gpt-4", openAIApiKey: OPENAI_API_KEY })
	let system = data.controls.system || "You are an AI assistant."
	system += "\nIf you do not know the answer, or would like to use a calculator, reply with three dots '...' and a search will be performed to provide you context."
	console.log(system)
	console.log(data.messages.map((message) => message?.content || ""))
	let response = await chat.call([new SystemChatMessage(system), ...data.messages.map((message) => new HumanChatMessage(message?.content || ""))])
	console.log(response)
	if (response.text.toLowerCase().trim() === "idk") {
		const model = new OpenAI({ temperature: 0, openAIApiKey: OPENAI_API_KEY })
		const tools = [new SerpAPI(SERPAPI_API_KEY), new Calculator()]
		const executor = await initializeAgentExecutor(tools, model, "zero-shot-react-description")
		console.log("Loaded agent.")
		let input = data.messages.at(-1).content
		console.log(`Executing with input "${input}"...`)
		const result = await executor.call({ input })
		console.log(`Got output ${result.output}`)
		data.messages.push({ role: "assistant", content: result.output, id: crypto.randomUUID(), date: new Date().toISOString() })
	} else {
		data.messages.push({ role: "assistant", content: response.text, id: crypto.randomUUID(), date: new Date().toISOString() })
	}
	return json(data)
}
