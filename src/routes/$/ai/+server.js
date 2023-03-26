import { json } from "@sveltejs/kit"
import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST({ request }) {
	let data = await request.json()
	let system = data.system || `You are an AI coding assistant. You are having a conversation with another AI coding assistant. You are both trying to write code to solve a problem. Respond in Markup syntax.${data.document?.length ? `\nUse the following document as context if it applies:\n${data.document}` : ""}`
	let messages = [
		{
			role: "system",
			content: system
		},
		...data.messages.map((message) => ({ role: message.role, content: message.content }))
	]
	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages
	})
	return json(response.data)
}
