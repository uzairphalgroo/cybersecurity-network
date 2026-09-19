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
        dark: {
          950: '#000000',
          900: '#050505',
          850: '#0a0a0a',
          800: '#121212',
          750: '#18181b',
          700: '#27272a',
        },
        cyber: {
          white: '#ffffff',
          silver: '#e4e4e7',
          dim: '#71717a',
          accent: '#ffffff',
          danger: '#ff3344',
          warning: '#ffaa00',
          success: '#00ffaa',
          neon: '#00f0ff',
          violet: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', '-apple-system', 'sans-serif'],
        tech: ['Space Grotesk', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-chromatic': 'linear-gradient(135deg, #ffffff 0%, #a855f7 35%, #06b6d4 70%, #ffffff 100%)',
        'gradient-silver': 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
      }
    },
  },
  plugins: [],
}
