/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'sugar-magic'", "system-ui", "sans-serif"]
      },
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: "#4850E0"
      },
      borderRadius: {
        "magic-in": "15px",
        "magic-out": "20px"
      }
    }
  },
  plugins: []
};

