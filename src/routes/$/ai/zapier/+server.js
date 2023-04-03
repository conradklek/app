import { json } from "@sveltejs/kit"
import { OpenAI } from "langchain"
import { ChatOpenAI } from "langchain/chat_models"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"
import { initializeAgentExecutor, ZapierToolKit } from "langchain/agents"
import { SerpAPI, ZapierNLAWrapper } from "langchain/tools"
import { OPENAI_API_KEY, SERPAPI_API_KEY, ZAPIER_NLA_API_KEY } from "$env/static/private"
import { updateUser, getUserByUsername } from "$lib/server/controllers/user"

function createMessage(role, content) {
	return { role, content, id: crypto.randomUUID(), date: new Date().toISOString() }
}

export async function POST({ request, locals }) {
	if (!locals.user?.username) {
		return json({ status: 400, message: "Unauthorized" })
	}
	let data = await request.formData()
	let prompt = data.get("prompt") || ""
	if (prompt?.trim()?.startsWith("@")) {
		let user = await getUserByUsername(locals.user.username)
		let keys = Object.keys(user.data).filter((key) => key.endsWith(".gpt"))
		let bots = keys.map((bot) => {
			return { [bot]: user.data[bot] }
		})
		let robot = bots.find((bot) => Object.keys(bot)[0].slice(0, -4) === prompt.trim().slice(1, Object.keys(bot)[0].length - 3)) || null
		if (!robot) {
			return json({ status: 400, message: "Bot not found" })
		}
		let { controls, messages } = JSON.parse(robot[Object.keys(robot)[0]].file.contents)
		let chat = new ChatOpenAI({ temperature: controls.temperature || 0.7, modelName: "gpt-4", openAIApiKey: OPENAI_API_KEY })
		let system = controls?.system || "You are an AI assistant."
		console.log(system)
		console.log(messages.map((message) => message?.content || ""))
		let response = await chat.call([new SystemChatMessage(system), ...messages.map((message) => new HumanChatMessage(message?.content || ""))])
		console.log(response)
		messages.push(createMessage("user", prompt))
		messages.push(createMessage("assistant", response.text))
		user.data[Object.keys(robot)[0]].file.contents = JSON.stringify({ controls, messages })
		await updateUser(user._id, user.data)
		let _messages = JSON.parse(data.get("messages")) || []
		_messages = [..._messages, messages.at(-2), messages.at(-1)]
		return json({ status: 200, message: JSON.stringify({ messages: _messages }), type: "success" })
	}
	let messages = JSON.parse(data.get("messages")) || []
	messages.push(createMessage("user", prompt))
	let chat = new ChatOpenAI({ temperature: 0.7, modelName: "gpt-4", openAIApiKey: OPENAI_API_KEY })
	let systemMessage
	if (locals.user.username === "conradklek") {
		systemMessage = "You are an AI assistant. If you are asked to perform an action, such as sending an email, reply with a single exclamation point '!', and it will be performed for you. If you require additional information beyond the scope of this conversation, reply with a single question mark '?' and a search will be performed to provide you with additional context."
	} else {
		systemMessage = "You are an AI assistant. If you require additional information beyond the scope of this conversation, reply with a single question mark '?' and a search will be performed to provide you with additional context."
	}
	let chatMessages = [new SystemChatMessage(systemMessage), ...messages.map((msg) => new HumanChatMessage(msg?.content || ""))]
	let response = await chat.call(chatMessages)
	if (response.text.trim() === "!" || response.text.trim() === "?") {
		let model = new OpenAI({ temperature: 0, openAIApiKey: OPENAI_API_KEY })
		let tools = response.text.trim() === "!" ? (locals.user.username === "conradklek" ? [await ZapierToolKit.fromZapierNLAWrapper(new ZapierNLAWrapper(ZAPIER_NLA_API_KEY))] : [new SerpAPI(SERPAPI_API_KEY)]) : [new SerpAPI(SERPAPI_API_KEY)]
		let executor = await initializeAgentExecutor(tools, model, "zero-shot-react-description", response.text.trim() === "!")
		let result = await executor.call({ input: prompt })
		messages.push(createMessage("assistant", result.output))
		console.log(response.text.trim(), result.output)
	} else {
		messages.push(createMessage("assistant", response.text))
		console.log(response.text)
	}
	return json({ status: 200, message: JSON.stringify({ messages }), type: "success" })
}
