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
          navy: '#15324F',
          teal: '#087F8C',
          white: '#FFFFFF',
          lightGray: '#F5F7F9',
          charcoal: '#202B36',
        },
        hospital: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7ccbfd',
          400: '#38b0fa',
          500: '#0ea0ea',
          600: '#15324F',
          700: '#0c486e',
          800: '#075685',
          900: '#082e49',
          950: '#051d2f',
        },
        clinical: {
          50: '#f0fdf9',
          100: '#ccfbf0',
          200: '#99f6e0',
          300: '#5eead2',
          400: '#2dd4bf',
          500: '#087F8C',
          600: '#087F8C',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium': '0 10px 50px -12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
