import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#121212",
        "surface-2": "#1a1a1a",
        ink: "#f5f1ea",
        accent: "#ff5b1f",
        "accent-ink": "#0a0a0a",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        kicker: "0.08em",
        caption: "0.02em",
        tight: "-0.04em",
        tighter: "-0.03em",
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.04em" }],
        "display-lg": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "h-md": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        caption: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        micro: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.08em" }],
      },
      boxShadow: {
        lift: "0 1px 0 0 rgba(245,241,234,0.04), 0 8px 24px -8px rgba(0,0,0,0.6)",
        "accent-lift": "0 1px 0 0 rgba(255,91,31,0.2), 0 8px 24px -8px rgba(255,91,31,0.4)",
      },
      keyframes: {
        "studio-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cursor: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "studio-up": "studio-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
        cursor: "cursor 1.1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
