/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F5',
        surface: {
          50: '#FFFFFF',
          100: '#F5F3ED',
          200: '#EDE8DE',
          300: '#E0D8CA',
        },
        hairline: {
          DEFAULT: '#E6DFD5',
          dark: '#D4C9BC',
        },
        ink: {
          DEFAULT: '#141413',
          muted: '#66645E',
          subtle: '#99968E',
        },
        cognac: {
          DEFAULT: '#8C4E2A',
          dark: '#4A2814',
          light: '#C47C4E',
          soft: '#F4EAE2',
        },
        accent: {
          blue: '#0071E3',
          'blue-hover': '#0062C4',
          green: '#10B981',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 40px -15px rgba(40, 20, 10, 0.07)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
