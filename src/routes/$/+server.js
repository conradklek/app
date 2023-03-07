import { json } from "@sveltejs/kit"
import { OPENAI_API_KEY } from "$env/static/private"

const key = OPENAI_API_KEY

export async function POST({ request }) {
	let data = await request.json()
	return json(data)
}
