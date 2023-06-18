const { light, dark } = require("@charcoal-ui/theme");
const { createTailwindConfig } = require("@charcoal-ui/tailwind-config");
/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  darkMode: true,
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  presets: [
    createTailwindConfig({
      version: "v3",
      theme: {
        ":root": light,
      },
    }),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0000004D",
        "primary-hover": "#11111199",
        "primary-press": "#11111199",
        "primary-disabled": "#00000099",
        secondary: "#0000004D",
        "secondary-hover": "#11111199",
        "secondary-press": "#11111199",
        "secondary-disabled": "#00000099",
        base: "#00000099",
        "text-primary": "#514062",
      },
      fontFamily: {
        M_PLUS_2: ["var(--font-m-plus-2)"],
        Montserrat: ["var(--font-montserrat)"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
