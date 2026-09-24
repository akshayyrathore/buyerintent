/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(240, 10%, 2%)",
        foreground: "hsl(0, 0%, 98%)",
        card: {
          DEFAULT: "hsl(240, 10%, 4%)",
          foreground: "hsl(0, 0%, 98%)"
        },
        popover: {
          DEFAULT: "hsl(240, 10%, 4%)",
          foreground: "hsl(0, 0%, 98%)"
        },
        primary: {
          DEFAULT: "hsl(250, 100%, 70%)",
          foreground: "hsl(0, 0%, 100%)"
        },
        secondary: {
          DEFAULT: "hsl(240, 5%, 15%)",
          foreground: "hsl(0, 0%, 98%)"
        },
        muted: {
          DEFAULT: "hsl(240, 5%, 15%)",
          foreground: "hsl(240, 5%, 65%)"
        },
        accent: {
          DEFAULT: "hsl(250, 100%, 70%)",
          foreground: "hsl(0, 0%, 100%)"
        },
        destructive: {
          DEFAULT: "hsl(0, 62.8%, 30.6%)",
          foreground: "hsl(0, 0%, 98%)"
        },
        border: "hsl(240, 5%, 15%)",
        input: "hsl(240, 5%, 15%)",
        ring: "hsl(250, 100%, 70%)"
      },
      borderRadius: {
        lg: "2rem",
        md: "1.5rem",
        sm: "1rem"
      },
      fontFamily: {
        heading: ['Unbounded', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};