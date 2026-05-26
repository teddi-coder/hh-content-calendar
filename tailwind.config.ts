import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'hh-grey-white': '#F1F1F1',
        'hh-warm-black': '#1B1918',
        'hh-blue': '#7DD3FC',
        'hh-green': '#65E499',
        'hh-yellow': '#F4F7A6',
        'hh-pink': '#FFA8D1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Poppins', 'Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
