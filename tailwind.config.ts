import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep dark fantasy backgrounds
        background: {
          DEFAULT: '#08060e',
          secondary: '#0e0b18',
          tertiary: '#161224',
        },
        // Arcane violet primary accent
        primary: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.4)',
        },
        // Ember gold secondary accent
        accent: {
          DEFAULT: '#d4a044',
          light: '#f4c76b',
          dark: '#b8862e',
          ember: '#e8b44f',
        },
        // Parchment-warm text palette
        text: {
          primary: '#e8e0d0',
          secondary: '#c4b99a',
          muted: '#7c7260',
        },
        // Dark glass surface cards
        surface: {
          DEFAULT: 'rgba(139, 92, 246, 0.04)',
          hover: 'rgba(139, 92, 246, 0.08)',
          border: 'rgba(139, 92, 246, 0.12)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        // Fantasy heading fonts
        cinzel: ['var(--font-cinzel)', 'Georgia', 'serif'],
        'cinzel-decorative': ['var(--font-cinzel-decorative)', 'Georgia', 'serif'],
        // Kept for cube route compatibility
        scribe: ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        manuscript: ['var(--font-cormorant-garamond)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139, 92, 246, 0.5)',
        'glow-sm': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 30px -8px rgba(212, 160, 68, 0.4)',
        card: '0 4px 30px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px rgba(139, 92, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #08060e 0%, #0e0b18 50%, #161224 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0.02) 100%)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'fantasy-glow': 'fantasyGlow 4s ease-in-out infinite',
        'ember-pulse': 'emberPulse 3s ease-in-out infinite',
        'rune-drift': 'runeDrift 20s linear infinite',
        'nebula-shift': 'nebulaShift 25s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fantasyGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(40px)' },
          '50%': { opacity: '0.7', filter: 'blur(50px)' },
        },
        emberPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        runeDrift: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)' },
        },
        nebulaShift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)', opacity: '0.5' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)', opacity: '0.35' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;
