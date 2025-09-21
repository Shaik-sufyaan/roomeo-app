// App configuration constants
export const CONFIG = {
  APP_NAME: 'Roomio',
  VERSION: '1.0.0',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
}

// Theme colors
export const COLORS = {
  primary: '#004D40',
  secondary: '#44C76F',
  background: '#F2F5F1',
  accent: '#D4AF37',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
}

// Screen dimensions and spacing
export const SIZES = {
  padding: 16,
  margin: 16,
  borderRadius: 8,
  iconSize: 24,
}

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
}