import { OpenAIApi, Configuration } from "openai"
import { OPENAI_API_KEY } from "$env/static/private"

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST({ request }) {
	const form = await request.formData()
	const prompt = form.get("profile")
	const response = await openai.createImage({ prompt, size: "256x256", response_format: "b64_json" })
	const data = JSON.stringify(response.data.data[0])
	return new Response(data)
}