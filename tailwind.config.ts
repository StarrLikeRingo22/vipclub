import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#E8A0A8",
          deep: "#C97B86",
          soft: "#F7DCE0",
        },
        blush: "#FBEEF0",
        gold: {
          DEFAULT: "#C9A24B",
          soft: "#E8D29A",
        },
        ink: {
          DEFAULT: "#3A2C30",
          soft: "#8A7A7E",
          deep: "#221A1E",
        },
        cream: "#FFF8F7",
        line: "#EFE3E5",
        leaf: "#5BA88A",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(180,120,130,.16)",
      },
    },
  },
  plugins: [],
};

export default config;
