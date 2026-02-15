import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0B0B0B",
          yellow: "#F5C400",
          gold: "#C9A227",
        },
      },
      boxShadow: {
        glow: "0 0 0 3px rgba(245, 196, 0, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
