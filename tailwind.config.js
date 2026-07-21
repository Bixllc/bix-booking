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

        // Marketing landing page palette — namespaced (land-*) to avoid
        // colliding with the app's own ink/canvas/muted/border tokens above.
        'land-ink': '#241f33',
        'land-ink-2': '#3a3448',
        violet: '#6650e0',
        'violet-deep': '#5a44c7',
        'violet-lite': '#7c6ef0',
        'violet-tint': '#f2eefd',
        'violet-tint-2': '#f1ecfd',
        amber: '#bb8b2c',
        'amber-tint': '#f4ecd8',
        'amber-card': '#faf4ea',
        'land-canvas': '#fbfaff',
        'land-line': '#ece7fa',
        'land-line-2': '#efeafb',
        'land-muted': '#57516a',
        'land-muted-2': '#6a647c',
        'land-muted-3': '#8a84a0',
        'land-faint': '#a49dbb',
        ok: '#22c55e',
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
        'land-chip': '13px',
        'land-card': '20px',
        'land-panel': '28px',
        'land-pill': '100px',
      },
      maxWidth: {
        shell: '1200px',
        hero: '840px',
        copy: '620px',
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
        rise: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(14px)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
        marq: {
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scrIn: 'scrIn 0.28s ease',
        rise: 'rise 0.7s ease both',
        slideUp: 'slideUp 0.6s ease both',
        marq: 'marq 28s linear infinite',
      },
    },
  },
  plugins: [],
}
