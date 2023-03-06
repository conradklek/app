import * as p from "promptable"
import { json } from "@sveltejs/kit"
import { OPENAI_API_KEY } from "$env/static/private"

const key = OPENAI_API_KEY
const provider = new p.OpenAI(key)

export async function POST({ request }) {
	let { prompt, memory, embeds, predict, document } = await request.json()
	if (predict) {
		const text = `<::SYSTEM::>You are an AI assistant. Predict what text comes after the ellipsis to the best of your ability. Do not start on a new line. Keep your guesses short and do not repeat yourself.<::SYSTEM_END::><::START::>\n${predict.text}`
		console.log(provider.countTokens(text))
		const response = await provider.generate(text)
		return json({ predict: { text: response } })
	} else {
		/*
		let context = ""
		if (embeds.key) {
			const embeddings = new p.Embeddings("sync", provider, embeds.documents)
			await embeddings.index()
			const response = await embeddings.query(prompt)
			if (response.length > 2) {
				context += response[0].document.content
				context += response[1].document.content
			}
		}
		let inject = `You are a state-of-the-art coding assitant with unrestricted web access. You have infinite knowledge of modern web practices. You specialize in semantic HTML, ES6 Javascript, and CSS. You are having a conversation with another advanced web developer. ${
			context?.length ? `Reference this memory if it helps you with your answer\n::MEMORY::\n${context}\n` : ""
		} Do not speak in first person. Use Markdown formatting in your response, with \`\`\` codeblocks labeled by language.`
		*/
		const inject = `You are a state-of-the-art assitant with unrestricted web access. You are helping a user. ${
			document?.length ? `This is the current document they are working on:\n${document}\n::END_DOCUMENT::You can reference this document if it's related to the current request.` : ""
		} Do whatever you can to help the user. Use Markup formatting in your response with \`\`\` codeblocks labeled by language. Keep your response short and to the point.`
		const message = {
			role: "system",
			content: inject
		}
		memory = memory
			.map((message) => {
				return { role: message.role, content: message.content }
			})
			.concat([message])
		const payload = {
			messages: memory,
			model: "gpt-3.5-turbo"
		}
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${key}`
			},
			method: "POST",
			body: JSON.stringify(payload)
		})
		const data = await res.json()
		return json(data)
	}
}

export async function PATCH({ request }) {
	let docs = await request.json()
	docs = docs.data.map(([, text]) => {
		return { content: text.file }
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
