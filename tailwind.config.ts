import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
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
        // Custom Project Colors
        gov: {
          DEFAULT: 'hsl(var(--gov-primary))',
          foreground: 'hsl(var(--gov-foreground))',
        },
        invest: {
          DEFAULT: 'hsl(var(--invest-green))',
          foreground: 'hsl(var(--invest-foreground))',
        },
        ai: {
          DEFAULT: 'hsl(var(--ai-amber))',
          foreground: 'hsl(var(--ai-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        display: ['Pretendard', 'sans-serif'],
        mono: ['Pretendard', 'Space Grotesk', 'monospace'], // Space Grotesk은 숫자 전용으로 사용 고려
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.1' }], // 72px
        '6xl': ['3.75rem', { lineHeight: '1.1' }], // 60px
        '5xl': ['3rem', { lineHeight: '1.1' }], // 48px
        '4xl': ['2.25rem', { lineHeight: '1.2' }], // 36px
        '3xl': ['1.875rem', { lineHeight: '1.2' }], // 30px
        '2xl': ['1.5rem', { lineHeight: '1.3' }], // 24px
        xl: ['1.25rem', { lineHeight: '1.4' }], // 20px
        lg: ['1.125rem', { lineHeight: '1.5' }], // 18px
        base: ['1rem', { lineHeight: '1.65' }], // 16px
        sm: ['0.875rem', { lineHeight: '1.65' }], // 14px
        xs: ['0.75rem', { lineHeight: '1.65' }], // 12px
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.03em',
      },
      boxShadow: {
        'custom-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'custom-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'custom-lg': '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'custom-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.06)',
        'custom-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'custom-card-hover': '0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0px 0px rgba(var(--primary-rgb), 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0px 8px rgba(var(--primary-rgb), 0)' },
        },
        'shimmer': {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'slide-out-left': 'slide-out-left 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
        'colors-shadow': 'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addBase, addUtilities }) => {
      addBase({
        // Headings with better typography (example, actual usage will be with utility classes)
        'h1': {
          fontSize: 'var(--font-size-7xl)',
          fontWeight: '800', // ExtraBold
          letterSpacing: 'var(--letter-spacing-tightest)',
          lineHeight: 'var(--line-height-display)',
        },
        'h2': {
          fontSize: 'var(--font-size-3xl)',
          fontWeight: '700', // Bold
          letterSpacing: 'var(--letter-spacing-tighter)',
          lineHeight: 'var(--line-height-heading)',
        },
        'h3': {
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '600', // SemiBold
          lineHeight: 'var(--line-height-subheading)',
        },
      });

      addUtilities({
        '.section-title': {
          '@apply text-4xl lg:text-5xl font-display font-extrabold tracking-tightest mb-6 lg:mb-10': {},
        },
        '.text-display': {
          '@apply font-display tracking-tightest': {},
        },
        '.text-heading': {
          '@apply font-display tracking-tighter': {},
        },
        '.text-subheading': {
          '@apply font-display tracking-tight': {},
        },
        '.glass-card': {
          '@apply bg-card/70 backdrop-blur-xl border border-border/50 shadow-custom-glass transition-colors-shadow duration-300': {},
        },
        '.gradient-text': {
          '@apply bg-clip-text text-transparent': {},
        },
        '.gradient-gov': {
          '@apply bg-gradient-to-r from-gov to-primary': {},
        },
        '.gradient-invest': {
          '@apply bg-gradient-to-r from-invest to-gov': {},
        },
        '.gradient-ai': {
          '@apply bg-gradient-to-r from-ai to-invest': {},
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none', /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none', /* Chrome, Safari and Opera */
          },
        },
        '.shine': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 1.5s infinite',
          },
        },
      });
    }),
  ],
} satisfies Config;

export default config;