import * as p from "promptable"
import { json } from "@sveltejs/kit"
import { createParser } from "eventsource-parser"
import { OPENAI_API_KEY } from "$env/static/private"

const key = OPENAI_API_KEY
const provider = new p.OpenAI(key)

async function OpenAIStream(payload) {
	const encoder = new TextEncoder()
	const decoder = new TextDecoder()
	let counter = 0
	const res = await fetch("https://api.openai.com/v1/completions", {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		method: "POST",
		body: JSON.stringify(payload)
	})
	const stream = new ReadableStream({
		async start(controller) {
			function onParse(event) {
				if (event.type === "event") {
					const data = event.data
					if (data === "[DONE]") {
						controller.close()
						return
					}
					try {
						const json = JSON.parse(data)
						const text = json.choices[0].text
						if (counter < 2 && (text.match(/\n/) || []).length) {
							return
						}
						const queue = encoder.encode(text)
						controller.enqueue(queue)
						counter++
					} catch (e) {
						controller.error(e)
					}
				}
			}
			const parser = createParser(onParse)
			for await (const chunk of res.body) {
				parser.feed(decoder.decode(chunk))
			}
		}
	})
	return stream
}

export async function POST({ request }) {
	let { prompt, memory, embeds } = await request.json()
	let context = ""
	if (embeds.key) {
		const embeddings = new p.Embeddings("sync", provider, embeds.documents)
		embeddings.clearCache()
		await embeddings.index()
		const response = await embeddings.query(prompt)
		if (response.length) {
			context += response[0].document.content
		}
	}
	let inject = `You are a state-of-the-art coding assitant. You have infinite knowledge of modern web practices. You specialize in semantic html, ES6 javascript, and CSS. You are having a conversation with another advanced web developer. ${
		context?.length
			? `Use the following context if it helps you with your answer:\n\n${context}\n\n`
			: ""
	} When it is your turn, respond to the best of your ability. If your response involves code, reply using only the code - you don't need to explain yourself. Use Markdown formatting in your response as needed, with \`\`\` code-blocks labeled by language. Let's begin:\n\n`
	console.log(inject, provider.countTokens(`${inject}${memory}`))
	const payload = {
		prompt: `${inject}${memory}`,
		model: "text-davinci-003",
		temperature: 0.7,
		max_tokens: 2048,
		top_p: 1.0,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	}
	const stream = await OpenAIStream(payload)
	return new Response(stream)
}

export async function PATCH({ request }) {
	let docs = await request.json()
	docs = docs.data.map(([, text]) => {
		return { content: text }
	})
	const splitter = new p.CharacterTextSplitter("\n")
	docs = splitter.splitDocuments(docs, {
		chunk: true,
		chunkSize: 1000
	})
	const embeds = new p.Embeddings("sync", provider, docs)
	embeds.clearCache()
	await embeds.index()
	return json({
		embeddings: embeds.embeddings,
		documents: embeds.documents,
		key: embeds.key
	})
}
