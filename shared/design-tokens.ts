/**
 * Design Tokens (JS)
 * - CSS 변수(HSL)와 동기화된 값
 * - 서버사이드 / 이메일 템플릿 등 CSS 변수 접근 불가한 곳에서 사용
 */
export const DESIGN_TOKENS = {
  colors: {
    primary: { default: "hsl(240,60%,50%)", light: "hsl(240,60%,60%)", dark: "hsl(240,60%,40%)" },
    // 새로운 비즈니스별 Primary 색상 추가
    govPrimary: { default: "hsl(220,70%,50%)", light: "hsl(220,80%,60%)", dark: "hsl(220,70%,40%)" },
    investPrimary: { default: "hsl(160,60%,40%)", light: "hsl(160,70%,50%)", dark: "hsl(160,60%,30%)" },
    secondary: { default: "hsl(220,16%,93%)", foreground: "hsl(220,20%,30%)" }, // foreground는 CSS와 동일하게 유지
    success: { default: "hsl(152,76%,36%)", light: "hsl(152,60%,48%)", dark: "hsl(152,76%,30%)" },
    warning: { default: "hsl(38,92%,50%)", light: "hsl(45,93%,58%)", dark: "hsl(32,95%,44%)" },
    error: { default: "hsl(0,72%,55%)", light: "hsl(0,86%,70%)", dark: "hsl(0,72%,45%)" },
    info: { default: "hsl(210,80%,52%)", foreground: "hsl(0,0%,100%)", light: "hsl(210,80%,62%)", dark: "hsl(210,80%,42%)" },
    neutral: { // CSS 변수와는 명칭이 다르지만, Tailwind colors.extend의 HSL 값과 유사하게 유지
      50: "hsl(220,16%,96%)", // --background
      100: "hsl(220,16%,93%)", // --secondary, --muted
      200: "hsl(220,16%,90%)", // --border
      300: "hsl(220,12%,80%)",
      400: "hsl(220,12%,50%)", // --muted-foreground
      500: "hsl(220,14%,40%)",
      600: "hsl(220,20%,30%)", // --secondary-foreground
      700: "hsl(222,25%,20%)",
      800: "hsl(225,18%,11%)", // --card (dark)
      900: "hsl(225,20%,7%)", // --background (dark)
    },
  },
  fonts: {
    sans: '\'Pretendard\', \'Noto Sans KR\', -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    heading: '\'Pretendard\', \'Noto Sans KR\', sans-serif',
  },
  shadows: {
    soft: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
    elevated: "0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
  },
  radius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.625rem", // 10px (var(--radius))
    xl: "0.875rem", // 14px (calc(var(--radius) + 0.25rem))
    "2xl": "1.125rem", // 18px (calc(var(--radius) + 0.5rem))
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
