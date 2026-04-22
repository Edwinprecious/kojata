/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          50: '#F0F7FF',
          100: '#E6F0FF',
          600: '#007BFF',
          800: '#0052A3',
          900: '#003366',
        },
      },
      fontFamily: {
        caslon: ['Libre Caslon Text', 'serif'],
      },
      backgroundColor: {
        'pure-white': '#FFFFFF',
      }
    },
  },
  plugins: [],
}