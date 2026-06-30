/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces ("asphalt")
        asphalt: {
          DEFAULT: "#0B0B0B", // page background
          900: "#0B0B0B",
          800: "#141416",
          700: "#1A1A1D",
          600: "#222226",
          500: "#2C2C31",
        },
        // F1 brand red
        racing: {
          DEFAULT: "#E10600",
          600: "#C10500",
          400: "#FF2B26",
        },
        // Functional feedback colors borrowed from F1 timing screens
        sector: {
          purple: "#B026FF", // fastest / perfect
          green: "#26D07C", //  good / personal best
          yellow: "#F5C518", // close / slower
        },
        ink: {
          DEFAULT: "#F5F5F5",
          muted: "#8A8A8E",
          faint: "#5A5A5F",
        },
      },
      fontFamily: {
        // Loaded in index.html via Google Fonts
        display: ['"Saira"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(225,6,0,0.4), 0 0 24px -4px rgba(225,6,0,0.5)",
      },
      keyframes: {
        "flip-in": {
          "0%": { transform: "rotateX(-90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)", opacity: "1" },
        },
        "pop": {
          "0%": { transform: "scale(0.92)" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "shake": {
          "10%, 90%": { transform: "translateX(-1px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translateX(-4px)" },
          "40%, 60%": { transform: "translateX(4px)" },
        },
        "rise": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "sweep": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "flip-in": "flip-in 0.45s ease forwards",
        pop: "pop 0.18s ease",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        rise: "rise 0.35s ease forwards",
        sweep: "sweep 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
