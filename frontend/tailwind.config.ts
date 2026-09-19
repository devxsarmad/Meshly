import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-plex-sans)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      fontSize: {
        h1: ['var(--font-size-h1)', { lineHeight: 'var(--line-height-heading)', fontWeight: '600' }],
        h2: ['var(--font-size-h2)', { lineHeight: 'var(--line-height-heading)', fontWeight: '600' }],
        h3: ['var(--font-size-h3)', { lineHeight: 'var(--line-height-heading)', fontWeight: '600' }],
        h4: ['var(--font-size-h4)', { lineHeight: 'var(--line-height-heading)', fontWeight: '500' }],
        body: ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        small: ['var(--font-size-small)', { lineHeight: 'var(--line-height-body)' }],
      },
      borderRadius: { DEFAULT: 'var(--radius-default)' },
      boxShadow: { subtle: 'var(--shadow-subtle)' },
      spacing: { section: 'var(--section-spacing)' },
    },
  },
  plugins: [],
};

export default config;
