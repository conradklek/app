import adapter from "@sveltejs/adapter-vercel"
import { vitePreprocess } from "@sveltejs/kit/vite"

const config = {
	kit: {
		adapter: adapter({
			runtime: "nodejs18.x"
		}),
		output: {
			preloadStrategy: "preload-mjs"
		}
	},
	preprocess: [
		vitePreprocess({
			postcss: true
		})
	]
}

export default config
