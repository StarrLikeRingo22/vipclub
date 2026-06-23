import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rose gold accent
        rose: {
          DEFAULT: "#B76E79",
          deep: "#B76E79",   // accent text/links/prices (rose gold)
          soft: "#F0E2E3",   // subtle rose tint for selected rows
        },
        burgundy: "#7A3E48", // active sidebar / selected states
        blush: "#F3EAE6",
        // Warning amber
        gold: {
          DEFAULT: "#C58A2B",
          soft: "#E7D2A6",
        },
        // Charcoal text
        ink: {
          DEFAULT: "#1C1C1C",
          soft: "#6F6A64",
          deep: "#000000",
        },
        cream: "#FAF7F2",     // warm ivory background
        line: "#ECE6DD",      // warm light border
        leaf: "#2F7D5C",      // success / completed / redeemed
        danger: "#B42318",    // errors / no-shows
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(28,28,28,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
