import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"Fira Mono"', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Cassanova design system */
        cass: {
          app: 'var(--cass-bg-app)',
          sidebar: 'var(--cass-bg-sidebar)',
          surface: 'var(--cass-bg-surface)',
          elevated: 'var(--cass-bg-elevated)',
          glass: 'var(--cass-bg-glass)',
          'glass-border': 'var(--cass-glass-border)',
          hover: 'var(--cass-hover)',
          'hover-active': 'var(--cass-hover-active)',
          pressed: 'var(--cass-pressed)',
          brand: {
            DEFAULT: 'var(--cass-brand-primary)',
            hover: 'var(--cass-brand-primary-hover)',
            active: 'var(--cass-brand-primary-active)',
            secondary: 'var(--cass-brand-secondary)',
          },
          text: {
            primary: 'var(--cass-text-primary)',
            secondary: 'var(--cass-text-secondary)',
            muted: 'var(--cass-text-muted)',
            subtle: 'var(--cass-text-subtle)',
          },
          border: {
            DEFAULT: 'var(--cass-border)',
            strong: 'var(--cass-border-strong)',
          },
          success: 'var(--cass-success)',
          warning: 'var(--cass-warning)',
          danger: 'var(--cass-danger)',
          info: 'var(--cass-info)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'cass-sm': 'var(--cass-shadow-sm)',
        'cass-md': 'var(--cass-shadow-md)',
        'cass-lg': 'var(--cass-shadow-lg)',
      },
      width: {
        sidebar: '260px',
        'sidebar-collapsed': '80px',
      },
      height: {
        titlebar: '36px',
      },
      transitionTimingFunction: {
        sidebar: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [animate],
} satisfies Config
