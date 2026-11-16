/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f9',
          100: '#d9ecf0',
          500: '#237392',
          600: '#1a5971',
          700: '#14495e',
          800: '#0f3849',
          900: '#0b2935',
        }
      }
    },
  },
  plugins: [],
}
