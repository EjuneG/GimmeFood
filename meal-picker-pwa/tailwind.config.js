/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        primary: '#1A1A1A',
        secondary: '#666666',
        accent: {
          DEFAULT: '#E85D47',
          light: '#F5A89C',
          dark: '#D44A33',
        },
        divider: '#EEEEEE',
        muted: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', ...fontFamily.sans],
      },
      fontSize: {
        'title': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],      // 24px
        'section': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],   // 18px
        'body': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],     // 15px
        'caption': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],  // 13px
      },
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'calc(1rem + env(safe-area-inset-bottom))',
        'safe-bottom-nav': 'calc(4rem + env(safe-area-inset-bottom))',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'focus': '0 0 0 2px #E85D47',
      },
    },
  },
  plugins: [
    // Add utility for tabular numbers and screen reader only content
    function({ addUtilities }) {
      addUtilities({
        '.tabular-nums': {
          fontVariantNumeric: 'tabular-nums',
        },
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
      });
    },
  ],
}
