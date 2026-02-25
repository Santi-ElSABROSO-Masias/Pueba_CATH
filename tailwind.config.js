/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'catalina-green': '#00A064',
        'catalina-dusty-green': '#78C67B',
        'catalina-forest-green': '#145A52',
        'catalina-grey': '#333333',
        'catalina-highlight-orange': '#FF9132',
      }
    },
  },
  plugins: [],
}
