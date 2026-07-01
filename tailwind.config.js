/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16161d',
        'ink-soft': '#1f1f24',
        'ink-deep': '#050506',
        surface: '#ffffff',
        canvas: '#f6f6f9',
        border: '#ededf2',
        'border-2': '#e2e2ea',
        muted: '#9a9aa8',
        'muted-2': '#a3a3b0',
        faint: '#b4b4c0',
        gold: '#bf9a42',
        'gold-soft': '#e9ddc0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        meta: ['10px', { letterSpacing: '0.1em' }],
        kbd: ['11.5px', {}],
        label: ['12.5px', {}],
        body: ['13px', {}],
        base2: ['14px', {}],
        lead: ['17px', { fontWeight: '700' }],
        wordmark: ['20px', { letterSpacing: '-0.02em', fontWeight: '800' }],
        stat: ['30px', { letterSpacing: '-0.02em', fontWeight: '800' }],
      },
      borderRadius: {
        kbd: '5px',
        chip: '6px',
        field: '11px',
        btn: '11px',
        avatar: '10px',
        card: '18px',
        pill: '13px',
      },
      spacing: {
        sidebar: '248px',
        header: '74px',
      },
      backgroundImage: {
        'ink-grad': 'linear-gradient(135deg,#1f1f24,#050506)',
      },
      keyframes: {
        scrIn: {
          from: { transform: 'translateY(9px)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
      },
      animation: {
        scrIn: 'scrIn 0.28s ease',
      },
    },
  },
  plugins: [],
}
