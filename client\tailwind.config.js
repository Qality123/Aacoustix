/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#121212', secondary: '#1a1a1a', elevated: '#282828', highlight: '#333333' },
        text: { primary: '#ffffff', secondary: '#b3b3b3', subdued: '#808080' },
        accent: { DEFAULT: '#93c5fd', hover: '#fca5a5' },
      },
      spacing: { sidebar: '240px', player: '80px' },
    },
  },
  plugins: [],
}
