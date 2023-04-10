const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	darkMode: true,
	theme: {
		extend: {
			backgroundImage: {
				"circle-pattern": 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2.5 2.5" width="2" height="2" %3E%3Cdefs%3E%3Cpattern id="circlePattern" patternUnits="userSpaceOnUse" width="2" height="2" %3E%3Ccircle cx="1" cy="1" r="1" fill="%23000" /%3E%3C/pattern%3E%3C/defs%3E%3Crect width="2" height="2" fill="url(%23circlePattern)" /%3E%3C/svg%3E\')'
			}
		}
	},
	plugins: [require("@tailwindcss/typography")]
}

module.exports = config
