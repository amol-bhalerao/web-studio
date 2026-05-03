/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0b0f19',
          900: '#111827',
        },
        accent: {
          DEFAULT: '#6366f1',
          glow: '#818cf8',
        },
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(148,163,184,0.08), 0 24px 60px -12px rgba(15,23,42,0.45)',
      },
    },
  },
  plugins: [],
};
