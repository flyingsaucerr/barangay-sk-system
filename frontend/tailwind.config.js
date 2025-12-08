/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "government-blue": "#1d4ed8",
        "government-red": "#dc2626",
      },
    },
  },
  plugins: [],
}
