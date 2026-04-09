import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(20deg)' },
          '75%': { transform: 'rotate(-10deg)' },
        },
        /** Japanese handbook FAB — gentle float + micro tilt */
        handbookFabFloat: {
          '0%, 100%': {
            transform: 'translateY(0) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-7px) rotate(2.5deg)',
          },
        },
        /** AI assistant hero — slow float + subtle horizontal drift */
        harumiHeroFloat: {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
          },
          '33%': {
            transform: 'translateY(-10px) translateX(5px) rotate(1.2deg)',
          },
          '66%': {
            transform: 'translateY(-5px) translateX(-5px) rotate(-1deg)',
          },
        },
        /** Home landing — abstract “3D” blobs */
        landingBlobA: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(6%, -8%) scale(1.08)' },
        },
        landingBlobB: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(-10%, 6%) scale(1.06)' },
        },
        landingRibbon: {
          '0%, 100%': { transform: 'rotate(-8deg) translateY(0)' },
          '50%': { transform: 'rotate(-5deg) translateY(-14px)' },
        },
        landingCardStack: {
          '0%, 100%': { transform: 'translateY(0) rotateY(-12deg) rotateX(4deg)' },
          '50%': { transform: 'translateY(-10px) rotateY(-8deg) rotateX(6deg)' },
        },
        /** Hero sakura — gentle drift (transform on inner wrapper only) */
        landingSakuraFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-8px) translateX(4px)' },
        },
      },
      animation: {
        handbookFabFloat: 'handbookFabFloat 3.2s ease-in-out infinite',
        harumiHeroFloat: 'harumiHeroFloat 4.5s ease-in-out infinite',
        landingBlobA: 'landingBlobA 14s ease-in-out infinite',
        landingBlobB: 'landingBlobB 18s ease-in-out -3s infinite',
        landingRibbon: 'landingRibbon 6s ease-in-out infinite',
        landingCardStack: 'landingCardStack 7s ease-in-out infinite',
        landingSakuraFloat: 'landingSakuraFloat 7s ease-in-out infinite',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
