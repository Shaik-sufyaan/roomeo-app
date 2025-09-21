/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#004D40',
        secondary: '#44C76F',
        background: '#F2F5F1',
        accent: '#D4AF37'
      },
      fontFamily: {
        'geist-black': ['Geist-Black'],
        'geist-bold': ['Geist-Bold'],
        'geist-regular': ['Geist-Regular'],
      }
    },
  },
  plugins: [],
}