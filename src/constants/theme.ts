/**
 * Design tokens ported 1:1 from the web app (paktest-prep).
 * Single source of truth for colors, radius and spacing.
 */
import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F4F4F2',
    foreground: '#0A0A0A',
    card: '#FFFFFF',
    cardForeground: '#0A0A0A',
    popover: '#FFFFFF',
    popoverForeground: '#0A0A0A',
    primary: '#C6F432',
    primaryForeground: '#0A0A0A',
    secondary: '#ECECEA',
    secondaryForeground: '#0A0A0A',
    muted: '#ECECEA',
    mutedForeground: '#6B6B6B',
    accent: '#E4E4E1',
    accentForeground: '#0A0A0A',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    border: '#E3E3E0',
    input: '#E3E3E0',
    ring: '#C6F432',
    sidebar: '#FAFAF8',
    sidebarForeground: '#0A0A0A',
    chart1: '#C6F432',
    chart2: '#38BDF8',
    chart3: '#0A0A0A',
    chart4: '#6B6B6B',
    chart5: '#DC2626',
    // Legacy aliases — keep old key names working
    text: '#0A0A0A',
    backgroundElement: '#ECECEA',
    backgroundSelected: '#E4E4E1',
    textSecondary: '#6B6B6B',
  },
  dark: {
    background: '#000000',
    foreground: '#F5F5F5',
    card: '#101010',
    cardForeground: '#F5F5F5',
    popover: '#101010',
    popoverForeground: '#F5F5F5',
    primary: '#C6F432',
    primaryForeground: '#0A0A0A',
    secondary: '#1A1A1A',
    secondaryForeground: '#F5F5F5',
    muted: '#1A1A1A',
    mutedForeground: '#9C9C9C',
    accent: '#232323',
    accentForeground: '#F5F5F5',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#262626',
    input: '#262626',
    ring: '#C6F432',
    sidebar: '#050505',
    sidebarForeground: '#F5F5F5',
    chart1: '#C6F432',
    chart2: '#38BDF8',
    chart3: '#F5F5F5',
    chart4: '#9C9C9C',
    chart5: '#EF4444',
    // Legacy aliases
    text: '#F5F5F5',
    backgroundElement: '#1A1A1A',
    backgroundSelected: '#232323',
    textSecondary: '#9C9C9C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Web radius scale: base 0.9rem (≈14.4px) */
export const Radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 17,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;