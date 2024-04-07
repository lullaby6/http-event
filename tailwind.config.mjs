/** @type {import('tailwindcss').Config} */

import lullabyUI from "./src/extra/lullaby-ui";

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	darkMode: 'class',
	plugins: [lullabyUI, require('tailwind-scrollbar')],
}
