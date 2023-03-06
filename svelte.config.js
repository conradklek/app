import adapter from "@sveltejs/adapter-vercel"
import { vitePreprocess } from "@sveltejs/kit/vite"

const config = {
	kit: {
		adapter: adapter({
			runtime: "edge",
			runtime: "nodejs18.x"
		})
	},
	preprocess: [
		vitePreprocess({
			postcss: true
		})
	]
}

export default config
