/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#efe7d8",
        ink: "#14241c",
        leaf: "#1c7a4a",
        lime: "#e2f26b",
        sea: "#1d6a72",
        clay: "#c4543a",
        amber: "#c9841a",
        card: "#fffaf2",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(20, 36, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
