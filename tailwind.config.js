/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Saira Condensed"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design system "pelada" — token-driven (flips light/dark via CSS vars).
        // Bases stay hex (used with /opacity); -soft text tints + surfaces/ink/borders are vars.
        pitch: {
          bg: '#0d1320',
          deep: '#090c14',
          panel: '#1b2740',
        },
        team: {
          blue: '#3B82F6',
          'blue-soft': 'var(--team-blue-soft)',
          orange: '#F97316',
          'orange-soft': 'var(--team-orange-soft)',
        },
        heading: 'var(--heading)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--ink-muted)',
          dim: 'var(--ink-dim)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          strong: 'var(--surface-strong)',
          hover: 'var(--surface-hover)',
        },
        divider: {
          DEFAULT: 'var(--divider)',
          strong: 'var(--divider-strong)',
        },
        success: {
          DEFAULT: '#34d399',
          soft: 'var(--success-soft)',
        },
        warning: {
          DEFAULT: '#fbbf24',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: '#f43f5e',
          soft: 'var(--danger-soft)',
        },
        meio: {
          DEFAULT: '#8b5cf6',
          soft: 'var(--meio-soft)',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'white',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
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
      },
    },
    screens: {
      'sm': '590px',
      'md': '600px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}
