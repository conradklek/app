export async function GET() {
	return new Response("Hello, friend.", {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}

export async function POST({ request }) {
	const { prompt } = await request.json()
	return new Response(prompt.toUpperCase(), {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
