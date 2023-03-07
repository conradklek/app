const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {}
	},
	plugins: [require("@tailwindcss/line-clamp"), require("@tailwindcss/aspect-ratio")]
}

module.exports = config
