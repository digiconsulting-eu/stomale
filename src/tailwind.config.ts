
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0EA5E9",
          hover: "#0284C7",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          hover: "#F8FAFC",
        },
        success: {
          DEFAULT: "#2ECC71",
          hover: "#27AE60",
        },
        text: {
          DEFAULT: "#2C3E50",
          light: "#7F8C8D",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-bg.png')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
