import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
            background: 'var(--background)',
            foreground: 'var(--foreground)',
            card: {
                DEFAULT: 'var(--card)',
                foreground: 'var(--card-foreground)'
            },
            popover: {
                DEFAULT: 'var(--popover)',
                foreground: 'var(--popover-foreground)'
            },
            primary: {
                DEFAULT: 'var(--primary)',
                foreground: 'var(--primary-foreground)'
            },
            secondary: {
                DEFAULT: 'var(--secondary)',
                foreground: 'var(--secondary-foreground)'
            },
            muted: {
                DEFAULT: 'var(--muted)',
                foreground: 'var(--muted-foreground)'
            },
            accent: {
                DEFAULT: 'var(--accent)',
                foreground: 'var(--accent-foreground)'
            },
            destructive: {
                DEFAULT: 'var(--destructive)',
                foreground: 'var(--destructive-foreground)'
            },
            border: 'var(--border)',
            input: 'var(--input)',
            ring: 'var(--ring)',
            chart: {
                '1': 'var(--chart-1)',
                '2': 'var(--chart-2)',
                '3': 'var(--chart-3)',
                '4': 'var(--chart-4)',
                '5': 'var(--chart-5)'
            },
            /* Polished Grit brand colors */
            grit: {
                lime: '#536600',
                'lime-bright': '#d9fb5f',
                rose: '#b21d67',
                'rose-bright': '#fe5da2',
                sapphire: '#1e5bb8',
                charcoal: '#1c1b1b',
                surface: '#fcf9f8',
            },
            /* Legacy DowgNut tokens */
            dowgnut: {
                blue: '#1e5bb8',
                'blue-dark': '#07334f',
                pink: '#b21d67',
                'pink-soft': '#fe5da2',
                lime: '#d9fb5f',
                cream: '#fcf9f8',
            }
        },
        borderRadius: {
            lg: '0px',
            md: '0px',
            sm: '0px',
            xl: '0px',
            '2xl': '0px',
            full: '9999px'
        },
        boxShadow: {
            'grit': '4px 4px 0px 0px #1c1b1b',
            'grit-lg': '8px 8px 0px 0px #1c1b1b',
            'grit-sm': '2px 2px 0px 0px #1c1b1b',
        },
        fontFamily: {
            display: ['var(--font-display)', 'system-ui', 'sans-serif'],
            mono: ['var(--font-mono)', 'monospace'],
            body: ['var(--font-body)', 'system-ui', 'sans-serif'],
            sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        },
        borderWidth: {
            DEFAULT: '2px',
            '1': '1px',
            '2': '2px',
            '3': '3px',
            '4': '4px',
        },
    }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
