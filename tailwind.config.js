/** @type {import('tailwindcss').Config} */ export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#132b27",
        forest: "#0b3b35",
        mint: "#dff4e9",
        lime: "#d8f269",
        cream: "#f8f7ef",
        coral: "#ef795f",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Georgia", "serif"],
      },
      boxShadow: { soft: "0 18px 50px rgba(11,59,53,.10)" },
    },
  },
  plugins: [],
};
