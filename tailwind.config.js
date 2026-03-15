/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          // Warm golden tones matching the background image
          dark: '#1a1510',        // Dark brown
          purple: '#2d2418',      // Warm dark
          accent: '#4a3f2a',      // Golden brown
          glow: '#d4a853',        // Golden glow (from image heart)
          light: '#f5e6c8',       // Cream/warm light
          gold: '#c9a227',        // Rich gold
          amber: '#b8860b',       // Dark goldenrod
          cream: '#faf6ed',       // Soft cream
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sanctuary-bg': "url('/background.jpg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #d4a853, 0 0 10px #d4a853' },
          '100%': { boxShadow: '0 0 20px #d4a853, 0 0 30px #d4a853' },
        },
      },
    },
  },
  plugins: [],
}
