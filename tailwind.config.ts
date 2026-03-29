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
          DEFAULT: "hsl(210 80% 40%)", // 기존보다 차분하고 세련된 파란색
          light: "hsl(210 80% 55%)",
          dark: "hsl(210 80% 30%)",
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
          primary: "hsl(210 80% 40%)", // gov-primary와 유사하게 조정하여 일관성 유지
          "primary-l": "hsl(210 80% 55%)",
          "primary-d": "hsl(210 80% 30%)",
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
          primary: "hsl(210 80% 40%)",
          'primary-light': "hsl(210 80% 55%)",
          'primary-dark': "hsl(210 80% 30%)",
          secondary: "hsl(var(--pf-secondary))",
          accent: "hsl(var(--pf-accent))",
          card: "hsl(var(--pf-surface))",
          border: "hsl(var(--pf-border))",
        }
      },
      borderRadius: {
        lg: "0.5rem", // 기존 'var(--radius)'에서 고정값으로 변경하거나 'calc(var(--radius) - 2px)' 등 조정
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
        xl: "calc(0.5rem + 0.25rem)",
        "2xl": "calc(0.5rem + 0.5rem)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "soft-hover": "0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        elevated: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)",
        'card-soft': '0 1px 4px rgba(0, 0, 0, 0.06)', // 더욱 부드러운 그림자
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1), 0 3px 8px rgba(0, 0, 0, 0.05)', // hover 시 더 깊이감 있는 그림자
        'pf-glow': '0 0 20px hsl(var(--pf-glow) / 0.15)',
        'pf-card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'pf-card-hover': '0 20px 60px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'], // Pretendard를 우선순위로 변경하여 한국어 가독성 강화
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
        "pf-fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pf-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pf-scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pf-slide-left": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pf-slide-right": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pf-counter": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.95)" },
          "60%": { opacity: "1", transform: "translateY(-2px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pf-draw-line": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "pf-pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.15)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pf-fade-up": "pf-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "pf-fade-in": "pf-fade-in 0.6s ease-out both",
        "pf-scale-in": "pf-scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pf-slide-left": "pf-slide-left 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "pf-slide-right": "pf-slide-right 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "pf-counter": "pf-counter 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "pf-draw-line": "pf-draw-line 1s ease-out both",
        "pf-pulse-ring": "pf-pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
