/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-bengali)", "sans-serif"],
        serif: ["var(--font-bengali)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        velvet: '#3b2a60',
        lavender: '#d3c5f6',
        primary: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#e11d48", // Rich Crimson Rose primary
          600: "#be123c",
          700: "#9f1239",
          800: "#881337",
          900: "#4c0519",
        },
        dark: {
          50: "#f6f6f9",
          100: "#ececf3",
          200: "#d5d5e5",
          300: "#b1b1cd",
          400: "#8686ad",
          500: "#656592",
          600: "#50507a",
          700: "#414163",
          800: "#353551",
          900: "#12121a", // Smooth premium black
          950: "#09090d",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "premium-dark": "radial-gradient(ellipse at top, #310813, #09090d)",
      },
    },
  },
  plugins: [],
}
