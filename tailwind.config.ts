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
        background: "#FFFFFF",
        surface: "#F7F8F7",
        "surface-border": "#E4E7E5",
        teal: {
          deep: "#176B68",
          forest: "#124B4A",
          light: "#EAF3F2",
        },
        apricot: {
          muted: "#E7A66B",
          light: "#FDF5ED",
        },
        ink: "#202625",
        slate: {
          DEFAULT: "#697370",
          light: "#9CA4A1",
          faint: "#F0F2F1",
        },
        sage: {
          DEFAULT: "#6D9B7B",
          light: "#EFF5F1",
          dark: "#4A6E55",
        },
        amber: {
          warm: "#D9822B",
          light: "#FDF2E7",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        arabic: ["Amiri", "Traditional Arabic", "Scheherazade New", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(32, 38, 37, 0.04), 0 1px 2px rgba(32, 38, 37, 0.02)",
        card: "0 2px 8px rgba(32, 38, 37, 0.06)",
        modal: "0 12px 32px rgba(18, 75, 74, 0.12)",
      }
    },
  },
  plugins: [],
};
export default config;
