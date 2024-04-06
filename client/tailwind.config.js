/** @type {import('tailwindcss').Config} */
export default {
	content: ["./**/*.{js,ts,jsx,tsx,html}"],
	theme: {
		extend: {
			colors: { primary: "#76ABAE", light: "#eeeeee", darkest: "#222831", dark: "#31363f" },
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
