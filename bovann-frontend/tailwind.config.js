/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF", // Blanc
        secondary: "#FF0000", // Rouge
        accent: "#F8F8F8", // Blanc cassé pour les fonds
      },
    },
  },
  plugins: [],
}
