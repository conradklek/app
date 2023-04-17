import { json } from "@sveltejs/kit"
import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST({ request }) {
	const { prompt, size, n } = await request.json()
	const response = await openai.createImage({ prompt, size: size || "256x256", response_format: "b64_json", n: n || 1 })
	return json({ data: response.data.data })
}
