import { json } from "@sveltejs/kit"

export async function POST({ request, locals }) {
	const { user } = await request.json()
	console.log({ user })
	return json({ message: "Hello, world!" })
}
