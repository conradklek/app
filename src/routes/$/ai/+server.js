import { json } from "@sveltejs/kit"
import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"
import { getUserById, updateUser } from "$lib/server/controllers/user"

function walk(tree, path, data) {
	if (data) {
		if (path.length === 1) {
			if (typeof data === "string") {
				return (tree[path[0]].file.contents = data)
			} else {
				return (tree[path[0]].directory = data)
			}
		} else {
			return walk(tree[path[0]].directory, path.slice(1), data)
		}
	} else {
		if (path.length === 1) {
			return tree[path[0]]
		} else {
			return walk(tree[path[0]].directory, path.slice(1))
		}
	}
}

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

async function update({ locals, data, messages, controls, response }) {
	let user = await getUserById(locals.user.id)
	let path = data.path.split("/")
	walk(user.data, path.slice(1), JSON.stringify({ messages: [...messages, { role: "assistant", content: response.data.choices[0].message.content, id: response.data.id, date: new Date().toISOString() }], controls }))
	await updateUser(user._id, user.data)
}

export async function POST({ locals, request }) {
	if (!locals.user?.id) {
		return json({ status: 400, message: "Unauthorized" })
	}
	let data = await request.json()
	let controls = data.controls
	let messages = [
		{
			role: "system",
			content: controls.system || "You are an AI assistant."
		},
		...data.messages.map((message) => ({ role: message.role, content: message.content }))
	]
	console.log(controls)
	console.log(messages)
	const response = await openai.createChatCompletion({
		temperature: controls.temperature || 0.7,
		model: "gpt-4",
		stream: true,
		messages
	})
	const readable = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder()
			for (const chunk of response.data) {
				controller.enqueue(encoder.encode(chunk))
			}
			controller.close()
		}
	})
	return new Response(readable, {
		headers: { "Content-Type": "text/plain" }
	})
}
