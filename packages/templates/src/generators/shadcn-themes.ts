/**
 * shadcn/ui theme CSS variables
 * Based on official shadcn/ui documentation (2025)
 * All colors use OKLCH color space for better color consistency
 */

interface ShadcnTheme {
  light: {
    radius: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
  dark: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
}

/**
 * Neutral theme (default)
 */
const neutralTheme: ShadcnTheme = {
  light: {
    radius: '0.625rem',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.145 0 0)',
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
    secondary: 'oklch(0.97 0 0)',
    secondaryForeground: 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    mutedForeground: 'oklch(0.556 0 0)',
    accent: 'oklch(0.97 0 0)',
    accentForeground: 'oklch(0.205 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.708 0 0)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0 0)',
    sidebarForeground: 'oklch(0.145 0 0)',
    sidebarPrimary: 'oklch(0.205 0 0)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.97 0 0)',
    sidebarAccentForeground: 'oklch(0.205 0 0)',
    sidebarBorder: 'oklch(0.922 0 0)',
    sidebarRing: 'oklch(0.708 0 0)',
  },
  dark: {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.985 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.396 0.141 25.723)',
    destructiveForeground: 'oklch(0.637 0.237 25.331)',
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    ring: 'oklch(0.439 0 0)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.205 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(0.269 0 0)',
    sidebarRing: 'oklch(0.439 0 0)',
  },
};

/**
 * Gray theme
 */
const grayTheme: ShadcnTheme = {
  light: {
    radius: '0.625rem',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.13 0.028 261.692)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.13 0.028 261.692)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.13 0.028 261.692)',
    primary: 'oklch(0.21 0.034 264.665)',
    primaryForeground: 'oklch(0.985 0.002 247.839)',
    secondary: 'oklch(0.967 0.003 264.542)',
    secondaryForeground: 'oklch(0.21 0.034 264.665)',
    muted: 'oklch(0.967 0.003 264.542)',
    mutedForeground: 'oklch(0.551 0.027 264.364)',
    accent: 'oklch(0.967 0.003 264.542)',
    accentForeground: 'oklch(0.21 0.034 264.665)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.928 0.006 264.531)',
    input: 'oklch(0.928 0.006 264.531)',
    ring: 'oklch(0.707 0.022 261.325)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0.002 247.839)',
    sidebarForeground: 'oklch(0.13 0.028 261.692)',
    sidebarPrimary: 'oklch(0.21 0.034 264.665)',
    sidebarPrimaryForeground: 'oklch(0.985 0.002 247.839)',
    sidebarAccent: 'oklch(0.967 0.003 264.542)',
    sidebarAccentForeground: 'oklch(0.21 0.034 264.665)',
    sidebarBorder: 'oklch(0.928 0.006 264.531)',
    sidebarRing: 'oklch(0.707 0.022 261.325)',
  },
  dark: {
    background: 'oklch(0.13 0.028 261.692)',
    foreground: 'oklch(0.985 0.002 247.839)',
    card: 'oklch(0.21 0.034 264.665)',
    cardForeground: 'oklch(0.985 0.002 247.839)',
    popover: 'oklch(0.21 0.034 264.665)',
    popoverForeground: 'oklch(0.985 0.002 247.839)',
    primary: 'oklch(0.928 0.006 264.531)',
    primaryForeground: 'oklch(0.21 0.034 264.665)',
    secondary: 'oklch(0.278 0.033 256.848)',
    secondaryForeground: 'oklch(0.985 0.002 247.839)',
    muted: 'oklch(0.278 0.033 256.848)',
    mutedForeground: 'oklch(0.707 0.022 261.325)',
    accent: 'oklch(0.278 0.033 256.848)',
    accentForeground: 'oklch(0.985 0.002 247.839)',
    destructive: 'oklch(0.704 0.191 22.216)',
    destructiveForeground: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.551 0.027 264.364)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.21 0.034 264.665)',
    sidebarForeground: 'oklch(0.985 0.002 247.839)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0.002 247.839)',
    sidebarAccent: 'oklch(0.278 0.033 256.848)',
    sidebarAccentForeground: 'oklch(0.985 0.002 247.839)',
    sidebarBorder: 'oklch(1 0 0 / 10%)',
    sidebarRing: 'oklch(0.551 0.027 264.364)',
  },
};

/**
 * Zinc theme (recommended default)
 */
const zincTheme: ShadcnTheme = {
  light: {
    radius: '0.625rem',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.141 0.005 285.823)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.141 0.005 285.823)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.141 0.005 285.823)',
    primary: 'oklch(0.21 0.006 285.885)',
    primaryForeground: 'oklch(0.985 0 0)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    muted: 'oklch(0.967 0.001 286.375)',
    mutedForeground: 'oklch(0.552 0.016 285.938)',
    accent: 'oklch(0.967 0.001 286.375)',
    accentForeground: 'oklch(0.21 0.006 285.885)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.92 0.004 286.32)',
    input: 'oklch(0.92 0.004 286.32)',
    ring: 'oklch(0.705 0.015 286.067)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0 0)',
    sidebarForeground: 'oklch(0.141 0.005 285.823)',
    sidebarPrimary: 'oklch(0.21 0.006 285.885)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.967 0.001 286.375)',
    sidebarAccentForeground: 'oklch(0.21 0.006 285.885)',
    sidebarBorder: 'oklch(0.92 0.004 286.32)',
    sidebarRing: 'oklch(0.705 0.015 286.067)',
  },
  dark: {
    background: 'oklch(0.141 0.005 285.823)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.21 0.006 285.885)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.21 0.006 285.885)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.92 0.004 286.32)',
    primaryForeground: 'oklch(0.21 0.006 285.885)',
    secondary: 'oklch(0.274 0.006 286.033)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.274 0.006 286.033)',
    mutedForeground: 'oklch(0.705 0.015 286.067)',
    accent: 'oklch(0.274 0.006 286.033)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    destructiveForeground: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.552 0.016 285.938)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.21 0.006 285.885)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.274 0.006 286.033)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(1 0 0 / 10%)',
    sidebarRing: 'oklch(0.552 0.016 285.938)',
  },
};

/**
 * Stone theme
 */
const stoneTheme: ShadcnTheme = {
  light: {
    radius: '0.625rem',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.147 0.004 49.25)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.147 0.004 49.25)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.147 0.004 49.25)',
    primary: 'oklch(0.216 0.006 56.043)',
    primaryForeground: 'oklch(0.985 0.001 106.423)',
    secondary: 'oklch(0.97 0.001 106.424)',
    secondaryForeground: 'oklch(0.216 0.006 56.043)',
    muted: 'oklch(0.97 0.001 106.424)',
    mutedForeground: 'oklch(0.553 0.013 58.071)',
    accent: 'oklch(0.97 0.001 106.424)',
    accentForeground: 'oklch(0.216 0.006 56.043)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.923 0.003 48.717)',
    input: 'oklch(0.923 0.003 48.717)',
    ring: 'oklch(0.709 0.01 56.259)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.985 0.001 106.423)',
    sidebarForeground: 'oklch(0.147 0.004 49.25)',
    sidebarPrimary: 'oklch(0.216 0.006 56.043)',
    sidebarPrimaryForeground: 'oklch(0.985 0.001 106.423)',
    sidebarAccent: 'oklch(0.97 0.001 106.424)',
    sidebarAccentForeground: 'oklch(0.216 0.006 56.043)',
    sidebarBorder: 'oklch(0.923 0.003 48.717)',
    sidebarRing: 'oklch(0.709 0.01 56.259)',
  },
  dark: {
    background: 'oklch(0.147 0.004 49.25)',
    foreground: 'oklch(0.985 0.001 106.423)',
    card: 'oklch(0.216 0.006 56.043)',
    cardForeground: 'oklch(0.985 0.001 106.423)',
    popover: 'oklch(0.216 0.006 56.043)',
    popoverForeground: 'oklch(0.985 0.001 106.423)',
    primary: 'oklch(0.923 0.003 48.717)',
    primaryForeground: 'oklch(0.216 0.006 56.043)',
    secondary: 'oklch(0.268 0.007 34.298)',
    secondaryForeground: 'oklch(0.985 0.001 106.423)',
    muted: 'oklch(0.268 0.007 34.298)',
    mutedForeground: 'oklch(0.709 0.01 56.259)',
    accent: 'oklch(0.268 0.007 34.298)',
    accentForeground: 'oklch(0.985 0.001 106.423)',
    destructive: 'oklch(0.704 0.191 22.216)',
    destructiveForeground: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.553 0.013 58.071)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.216 0.006 56.043)',
    sidebarForeground: 'oklch(0.985 0.001 106.423)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0.001 106.423)',
    sidebarAccent: 'oklch(0.268 0.007 34.298)',
    sidebarAccentForeground: 'oklch(0.985 0.001 106.423)',
    sidebarBorder: 'oklch(1 0 0 / 10%)',
    sidebarRing: 'oklch(0.553 0.013 58.071)',
  },
};

/**
 * Slate theme
 */
const slateTheme: ShadcnTheme = {
  light: {
    radius: '0.625rem',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.129 0.042 264.695)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.129 0.042 264.695)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.129 0.042 264.695)',
    primary: 'oklch(0.208 0.042 265.755)',
    primaryForeground: 'oklch(0.984 0.003 247.858)',
    secondary: 'oklch(0.968 0.007 247.896)',
    secondaryForeground: 'oklch(0.208 0.042 265.755)',
    muted: 'oklch(0.968 0.007 247.896)',
    mutedForeground: 'oklch(0.554 0.046 257.417)',
    accent: 'oklch(0.968 0.007 247.896)',
    accentForeground: 'oklch(0.208 0.042 265.755)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.929 0.013 255.508)',
    input: 'oklch(0.929 0.013 255.508)',
    ring: 'oklch(0.704 0.04 256.788)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: 'oklch(0.984 0.003 247.858)',
    sidebarForeground: 'oklch(0.129 0.042 264.695)',
    sidebarPrimary: 'oklch(0.208 0.042 265.755)',
    sidebarPrimaryForeground: 'oklch(0.984 0.003 247.858)',
    sidebarAccent: 'oklch(0.968 0.007 247.896)',
    sidebarAccentForeground: 'oklch(0.208 0.042 265.755)',
    sidebarBorder: 'oklch(0.929 0.013 255.508)',
    sidebarRing: 'oklch(0.704 0.04 256.788)',
  },
  dark: {
    background: 'oklch(0.129 0.042 264.695)',
    foreground: 'oklch(0.984 0.003 247.858)',
    card: 'oklch(0.208 0.042 265.755)',
    cardForeground: 'oklch(0.984 0.003 247.858)',
    popover: 'oklch(0.208 0.042 265.755)',
    popoverForeground: 'oklch(0.984 0.003 247.858)',
    primary: 'oklch(0.929 0.013 255.508)',
    primaryForeground: 'oklch(0.208 0.042 265.755)',
    secondary: 'oklch(0.279 0.041 260.031)',
    secondaryForeground: 'oklch(0.984 0.003 247.858)',
    muted: 'oklch(0.279 0.041 260.031)',
    mutedForeground: 'oklch(0.704 0.04 256.788)',
    accent: 'oklch(0.279 0.041 260.031)',
    accentForeground: 'oklch(0.984 0.003 247.858)',
    destructive: 'oklch(0.704 0.191 22.216)',
    destructiveForeground: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.551 0.027 264.364)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.208 0.042 265.755)',
    sidebarForeground: 'oklch(0.984 0.003 247.858)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.984 0.003 247.858)',
    sidebarAccent: 'oklch(0.279 0.041 260.031)',
    sidebarAccentForeground: 'oklch(0.984 0.003 247.858)',
    sidebarBorder: 'oklch(1 0 0 / 10%)',
    sidebarRing: 'oklch(0.551 0.027 264.364)',
  },
};

/**
 * Theme map for easy lookup
 */
export const themes: Record<string, ShadcnTheme> = {
  neutral: neutralTheme,
  gray: grayTheme,
  zinc: zincTheme,
  stone: stoneTheme,
  slate: slateTheme,
};

/**
 * Generate CSS for a theme (Tailwind CSS v4 format)
 * Based on official Tailwind CSS v4 documentation: https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration
 * 
 * Tailwind v4 uses CSS-first configuration with @theme inline directive.
 * Colors are stored in OKLCH format (Tailwind v4's default) and exposed via CSS variables.
 * NO tailwind.config.ts is needed - everything is configured in CSS.
 */
export function generateThemeCSS(
  theme: ShadcnTheme,
  customRadius?: string
): string {
  const radius = customRadius || theme.light.radius;

  // Tailwind v4 uses OKLCH colors by default (modern color space)
  // We store them in :root/.dark as CSS variables, then expose them via @theme inline
  // According to shadcn/ui docs for Tailwind v4, colors should be wrapped in hsl() for :root/.dark
  // but referenced directly in @theme inline

  return `@import "tailwindcss";
@source "../../../apps/**/*.{ts,tsx}";
@source "../../../components/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

:root {
  --radius: ${radius};
  --background: ${theme.light.background};
  --foreground: ${theme.light.foreground};
  --card: ${theme.light.card};
  --card-foreground: ${theme.light.cardForeground};
  --popover: ${theme.light.popover};
  --popover-foreground: ${theme.light.popoverForeground};
  --primary: ${theme.light.primary};
  --primary-foreground: ${theme.light.primaryForeground};
  --secondary: ${theme.light.secondary};
  --secondary-foreground: ${theme.light.secondaryForeground};
  --muted: ${theme.light.muted};
  --muted-foreground: ${theme.light.mutedForeground};
  --accent: ${theme.light.accent};
  --accent-foreground: ${theme.light.accentForeground};
  --destructive: ${theme.light.destructive};
  --destructive-foreground: ${theme.light.destructiveForeground};
  --border: ${theme.light.border};
  --input: ${theme.light.input};
  --ring: ${theme.light.ring};
  --chart-1: ${theme.light.chart1};
  --chart-2: ${theme.light.chart2};
  --chart-3: ${theme.light.chart3};
  --chart-4: ${theme.light.chart4};
  --chart-5: ${theme.light.chart5};
  --sidebar: ${theme.light.sidebar};
  --sidebar-foreground: ${theme.light.sidebarForeground};
  --sidebar-primary: ${theme.light.sidebarPrimary};
  --sidebar-primary-foreground: ${theme.light.sidebarPrimaryForeground};
  --sidebar-accent: ${theme.light.sidebarAccent};
  --sidebar-accent-foreground: ${theme.light.sidebarAccentForeground};
  --sidebar-border: ${theme.light.sidebarBorder};
  --sidebar-ring: ${theme.light.sidebarRing};
}

.dark {
  --background: ${theme.dark.background};
  --foreground: ${theme.dark.foreground};
  --card: ${theme.dark.card};
  --card-foreground: ${theme.dark.cardForeground};
  --popover: ${theme.dark.popover};
  --popover-foreground: ${theme.dark.popoverForeground};
  --primary: ${theme.dark.primary};
  --primary-foreground: ${theme.dark.primaryForeground};
  --secondary: ${theme.dark.secondary};
  --secondary-foreground: ${theme.dark.secondaryForeground};
  --muted: ${theme.dark.muted};
  --muted-foreground: ${theme.dark.mutedForeground};
  --accent: ${theme.dark.accent};
  --accent-foreground: ${theme.dark.accentForeground};
  --destructive: ${theme.dark.destructive};
  --destructive-foreground: ${theme.dark.destructiveForeground};
  --border: ${theme.dark.border};
  --input: ${theme.dark.input};
  --ring: ${theme.dark.ring};
  --chart-1: ${theme.dark.chart1};
  --chart-2: ${theme.dark.chart2};
  --chart-3: ${theme.dark.chart3};
  --chart-4: ${theme.dark.chart4};
  --chart-5: ${theme.dark.chart5};
  --sidebar: ${theme.dark.sidebar};
  --sidebar-foreground: ${theme.dark.sidebarForeground};
  --sidebar-primary: ${theme.dark.sidebarPrimary};
  --sidebar-primary-foreground: ${theme.dark.sidebarPrimaryForeground};
  --sidebar-accent: ${theme.dark.sidebarAccent};
  --sidebar-accent-foreground: ${theme.dark.sidebarAccentForeground};
  --sidebar-border: ${theme.dark.sidebarBorder};
  --sidebar-ring: ${theme.dark.sidebarRing};
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
}

