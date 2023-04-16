const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"]
			}
		}
	}
}

module.exports = config
