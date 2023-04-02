import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST({ request }) {
	const form = await request.formData()
	const prompt = form.get("prompt")
	const response = await openai.createImage({ prompt, size: "1024x1024", response_format: "b64_json" })
	const data = JSON.stringify(response.data.data[0])
	return new Response(data)
}
