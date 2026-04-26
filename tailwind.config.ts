import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    // ── Container widths ──────────────────────────────────────────
    'max-w-7xl', 'max-w-3xl', 'max-w-5xl', 'max-w-4xl', 'max-w-2xl', 'max-w-xl', 'max-w-lg', 'max-w-full',
    'mx-auto', 'w-full',
    { pattern: /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|none)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Spacing (padding / margin / gap) ─────────────────────────
    'px-4', 'py-16',
    'sm:px-6', 'sm:py-20',
    'lg:px-8', 'lg:py-24',
    { pattern: /^(px|py|pb|pt|pl|pr|mx|my|mb|mt|ml|mr|p|m)-(0|1|2|3|4|5|6|8|10|12|14|16|20|24|28|32|40|48)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^gap-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Typography — text size, weight, leading, tracking ────────
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^leading-(none|tight|snug|normal|relaxed|loose)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^text-(left|center|right|justify)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Grid layout ───────────────────────────────────────────────
    { pattern: /^grid-cols-(1|2|3|4|5|6|7|8|9|10|11|12|none)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^col-span-(1|2|3|4|5|6|7|8|9|10|11|12)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^col-(auto|start|end)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^columns-(1|2|3|4|5|6|7|8|9|10|11|12)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Display utilities ─────────────────────────────────────────
    { pattern: /^(block|inline-block|inline|flex|inline-flex|grid|table|table-cell|hidden)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Flex / alignment ──────────────────────────────────────────
    { pattern: /^flex-(row|col|row-reverse|col-reverse|wrap|nowrap|wrap-reverse)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^items-(start|end|center|baseline|stretch)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^justify-(start|end|center|between|around|evenly)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^self-(auto|start|end|center|stretch|baseline)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^order-(first|last|none|[0-9]|1[0-2])$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^(ml|mr|mt|mb)-auto$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Sizing ────────────────────────────────────────────────────
    { pattern: /^(w|h)-(auto|full|screen|0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/, variants: ['sm', 'md', 'lg', 'xl'] },

    // ── Position / overflow / z-index ─────────────────────────────
    { pattern: /^(sticky|static|fixed|absolute|relative)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^z-(0|10|20|30|40|50|auto)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^(left|right|top|bottom)-(0|px|1|2|3|4|5|6|8|10|12|16|auto)$/, variants: ['sm', 'md', 'lg', 'xl'] },
    { pattern: /^translate-x-/, variants: ['sm', 'md', 'lg', 'xl'] },
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        lg: 'calc(var(--radius) + 2px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    }
  },
  plugins: [
    animate,
    typography,
  ],
} satisfies Config;
