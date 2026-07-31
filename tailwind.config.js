/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'Inter', 'sans-serif'],
        stat: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        wine: {
          DEFAULT: '#6e1a28',
          dark: '#56131f',
          tint: '#f3e5e8',
        },
        paper: '#efece3',
        surface: '#ffffff',
        line: {
          DEFAULT: '#e6e1d4',
          soft: '#efe9dc',
        },
        ink: {
          DEFAULT: '#1b1a16',
          medium: '#4b463b',
          soft: '#8b8578',
          icon: '#a6a093',
        },
        team: {
          blue: {
            DEFAULT: '#24499c',
            dark: '#1c3576',
            tint: '#eef1fa',
          },
          orange: {
            DEFAULT: '#c2560f',
            dark: '#9e440a',
            tint: '#f8efe4',
          },
        },
        position: {
          def: '#d99a1a',
          mei: '#0d7a72',
          ata: '#c2560f',
        },
        state: {
          success: '#1f6b46',
          warning: '#9a6a10',
          warningBg: '#f6ecca',
          live: '#dc2626',
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
