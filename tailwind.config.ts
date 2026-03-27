import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
        },
        "gov-primary": {
          DEFAULT: "hsl(var(--gov-primary))",
          light: "hsl(var(--gov-primary-light))",
          dark: "hsl(var(--gov-primary-dark))",
        },
        "invest-primary": {
          DEFAULT: "hsl(var(--invest-primary))",
          light: "hsl(var(--invest-primary-light))",
          dark: "hsl(var(--invest-primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          light: "hsl(var(--success-light))",
          dark: "hsl(var(--success-dark))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          light: "hsl(var(--warning-light))",
          dark: "hsl(var(--warning-dark))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          light: "hsl(var(--error-light))",
          dark: "hsl(var(--error-dark))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          light: "hsl(var(--info-light))",
          dark: "hsl(var(--info-dark))",
        },
        // 포트폴리오 디자인 시스템 (CSS 변수 기반 - 다크모드 자동 지원)
        pf: {
          bg: "hsl(var(--pf-bg))",
          surface: "hsl(var(--pf-surface))",
          "surface-el": "hsl(var(--pf-surface-elevated))",
          text: "hsl(var(--pf-text))",
          "text-2": "hsl(var(--pf-text-secondary))",
          "text-m": "hsl(var(--pf-text-muted))",
          border: "hsl(var(--pf-border))",
          "border-s": "hsl(var(--pf-border-subtle))",
          primary: "hsl(var(--pf-primary))",
          "primary-l": "hsl(var(--pf-primary-light))",
          "primary-d": "hsl(var(--pf-primary-dark))",
          secondary: "hsl(var(--pf-secondary))",
          "secondary-l": "hsl(var(--pf-secondary-light))",
          accent: "hsl(var(--pf-accent))",
          "accent-l": "hsl(var(--pf-accent-light))",
          warm: "hsl(var(--pf-warm))",
          "warm-l": "hsl(var(--pf-warm-light))",
        },
        // 하위 호환 (기존 코드가 portfolio.* 으로 참조하는 곳 대응)
        portfolio: {
          background: "hsl(var(--pf-bg))",
          text: "hsl(var(--pf-text))",
          'text-light': "hsl(var(--pf-text-secondary))",
          primary: "hsl(var(--pf-primary))",
          'primary-light': "hsl(var(--pf-primary-light))",
          'primary-dark': "hsl(var(--pf-primary-dark))",
          secondary: "hsl(var(--pf-secondary))",
          accent: "hsl(var(--pf-accent))",
          card: "hsl(var(--pf-surface))",
          border: "hsl(var(--pf-border))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "soft-hover": "0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        elevated: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)",
        'card-soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'pf-glow': '0 0 20px hsl(var(--pf-glow) / 0.15)',
        'pf-card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'pf-card-hover': '0 20px 60px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'sans-serif'], // 모던한 sans-serif 폰트 추가
        serif: ['serif'],
        mono: ['monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
