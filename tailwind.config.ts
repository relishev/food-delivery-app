import type { Config } from "tailwindcss";
const config: Config = {
  content: ["src/app/components/**/*.{ts,tsx}", "src/app/widgets/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate")],
  theme: {
    colors: {
      accent: "#f5821f",
      "bg-1": "#fff",
      "bg-2": "#f1f1f1",

      "bg-cover": "rgb(0,0,0,0.7)",
      black: "#000",
      error: "#D00000",

      "gray-1": "#DCE1E7",
      "gray-2": "#E9ECEF",
      "gray-3": "#F8F9FA",
      info: "#4361ee",

      onHover: "rgba(245, 130, 31, 0.85)",
      primary: "#f5821f",
      success: "#208B3A",

      "text-1": "#21201f",
      "text-2": "#404040",

      "text-3": "#7D7C83",
      "text-4": "#888",
      warning: "#F8961E",
      white: "#fff",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            code: {
              "&::after": {
                content: "none !important",
              },
              "&::before": {
                content: "none !important",
              },
            },
          },
        },
      },
    },
    // DESKTOP-FIRST breakpoints (max-width, not min-width!)
    // Convention: prefix = "at this size and smaller"
    //   md:hidden  = hidden on mobile (≤720px), visible on desktop
    //   hidden md:block = visible on mobile (≤720px), hidden on desktop
    screens: {
      "2xl": { max: "1400px" },
      xl: { max: "1080px" },
      lg: { max: "820px" },
      md: { max: "720px" },
      sm: { max: "500px" },
    },
  },
};
export default config;
