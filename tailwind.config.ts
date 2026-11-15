import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#182235",
        muted: "#778196",
        line: "#e8ebf1",
        soft: "#f7f8fb",
        purple: {
          DEFAULT: "#6559e8",
          dark: "#5549d4",
          soft: "#f0efff",
          hover: "#5549d4",
          light: "#eae8ff",
        },
        green: {
          DEFAULT: "#219b75",
          soft: "#eaf7f1",
        },
        amber: {
          DEFAULT: "#bf812b",
          soft: "#fff6e8",
        },
        red: {
          DEFAULT: "#c76a65",
          soft: "#fff0ef",
        },
        navy: "#101827",
        sidebar: "#111b2b",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        heading: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 4px rgba(35, 46, 69, 0.02)",
        card: "0 3px 12px rgba(49, 50, 99, 0.04)",
        modal: "0 25px 80px rgba(14, 24, 43, 0.25)",
        floating: "0 10px 35px rgba(28, 39, 61, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
