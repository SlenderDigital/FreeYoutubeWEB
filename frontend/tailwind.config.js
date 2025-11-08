/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yt-black': '#0f0f0f',
        'yt-dark': '#181818',
        'yt-darker': '#0a0a0a',
        'yt-red': '#ff0000',
        'yt-red-hover': '#cc0000',
        'yt-gray': '#aaaaaa',
        'yt-light-gray': '#f1f1f1',
      },
    },
  },
  plugins: [],
}
