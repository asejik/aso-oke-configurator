/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We can add custom Aso Oke palette colors here later
      },
      aspectRatio: {
        'fabric': '9 / 16', // Defined in PRD FN-02
      }
    },
  },
  plugins: [],
}