/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
      },
      backgroundImage: {
        'grid-slate': `linear-gradient(to right, rgb(15 23 42 / 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(15 23 42 / 0.06) 1px, transparent 1px)`,
      },
      keyframes: {
        'marquee-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        'marquee-up': 'marquee-up 45s linear infinite',
      },
    },
  },
  plugins: [],
};
