/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f3faf5',
          100: '#e6f4ea',
          200: '#c1e3cc',
          300: '#8dcb9f',
          400: '#4fa86a',
          500: '#2f8c52',
          600: '#237043',
          700: '#1d5937',
          800: '#18472e',
          900: '#133a26'
        },
        earth: {
          50: '#fbf7f0',
          100: '#f4ead7',
          200: '#e7d2ae',
          300: '#d8b47d',
          400: '#c8914f',
          500: '#b87734',
          600: '#965d29',
          700: '#764821',
          800: '#5f3a1d',
          900: '#4f301a'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.10)'
      }
    }
  },
  plugins: []
};

