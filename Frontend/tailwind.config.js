/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        abhaya: ['"Abhaya Libre"', 'serif'],
        gemunu: ['"Gemunu Libre"', 'sans-serif'],
        yotive: ['"Yotive"', 'sans-serif'],
      },
      filter: {
        'brightness-75': '.75',
        'brightness-100': '1',
      },
    },
  },
  plugins: [],
}