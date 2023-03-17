import { json } from "@sveltejs/kit"
import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST({ request }) {
	let data = await request.json()
	let messages = [{ role: "system", content: "You are a state-of-the-art coding assistant. You are an expert in your field, particularly HTML, CSS, and Javascript. You are having a conversation with another advanced web developer. Answer their questions to the best of your ability. Keep your responses short and to the point. Use Markup syntax in your response." }]
	for (let i = 0; i < data.memory.length; i++) {
		messages.push({ role: data.memory[i].role, content: data.memory[i].content })
	}
	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages
	})
	return json(response.data)
}
