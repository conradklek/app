export async function GET({ url }) {
	let query = url.searchParams
	let name = query.get("name")
	if (!name) {
		name = "anon"
	}
	return new Response(`Hello, ${name}!`, {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
