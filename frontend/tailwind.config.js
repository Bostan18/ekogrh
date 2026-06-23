/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#e6f5ec',
          100: '#d3eedc',
          200: '#a7e3c0',
          300: '#6cc996',
          400: '#3ba973',
          500: '#1f8f53',
          600: '#157a45',
          700: '#1a6539',
          800: '#1c4f33',
          900: '#173e29',
          950: '#0f2b1c',
        },
        sand: {
          50:  '#fafaf6',
          100: '#f3f1eb',
          200: '#dedbd2',
          300: '#c1bdb1',
          400: '#a09b8d',
          500: '#7e7a6e',
          600: '#605d54',
          700: '#48463f',
          800: '#33312c',
        },
        gold: {
          50:  '#faf6e6',
          100: '#f5ecc8',
          200: '#e5cd8b',
          300: '#d4b257',
          400: '#d0a634',
          500: '#c89a1d',
          600: '#a98317',
          700: '#8a6c11',
        },
        ink: '#211f17',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.03)',
        drawer: '-8px 0 40px rgb(0 0 0 / 0.12)',
      },
      borderRadius: {
        lg: '7px',
        xl: '10px',
      },
    },
  },
  plugins: [],
}
