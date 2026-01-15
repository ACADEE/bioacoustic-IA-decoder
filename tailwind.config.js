/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors for bioacoustic theme
        thermal: {
          cold: '#1e3a8a',
          cool: '#3b82f6',
          warm: '#fbbf24',
          hot: '#ef4444',
        },
        neon: {
          green: '#10b981',
          blue: '#06b6d4',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
