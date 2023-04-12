export async function GET({ url }) {
	let { name } = url.searchParams
	if (!name) {
		name = "anon"
	}
	return new Response(`Hello, ${name}!`, {
		headers: {
			"Content-Type": "text/plain"
		}
	})
}
