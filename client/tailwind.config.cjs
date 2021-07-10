const colors = require('tailwindcss/colors')
const Color = require('color')
const alpha = (clr, val) => Color(clr).alpha(val).rgb().string()
const lighten = (clr, val) => Color(clr).lighten(val).rgb().string()
const darken = (clr, val) => Color(clr).darken(val).rgb().string()
const whiten = (clr, val) => Color(clr).whiten(val).rgb().string()

const brandcolor = '#6A983C'

module.exports = {
  mode: "jit",
  purge: [
    "./src/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    colors: {
      blue: colors.blue,
      red: colors.red,
      green: colors.green,
      brand: {
        // default: brandcolor, // => .bg-brand
        // light: lighten(brandcolor, 0.3), // => .bg-brand-lighter
        // dark: darken(brandcolor, 0.3), // => .bg-brand-lighter
         '50': whiten(lighten(brandcolor, 1.3), 0.1), // => .bg-brand-75
        '100': whiten(lighten(brandcolor, 1.0), 0.04), // => .bg-brand-75
        '200': lighten(brandcolor, 0.8), // => .bg-brand-75
        '300': lighten(brandcolor, 0.6), // => .bg-brand-75
        '400': lighten(brandcolor, 0.3), // => .bg-brand-75
        '500': lighten(brandcolor, 0.0), // => .bg-brand-75
        '600': darken(brandcolor, 0.1), // => .bg-brand-75
        '700': darken(brandcolor, 0.2), // => .bg-brand-75
        '800': darken(brandcolor, 0.3), // => .bg-brand-75
        '900': darken(brandcolor, 0.4), // => .bg-brand-75
      },
      amber: colors.amber,
      gray: colors.coolGray,
      white: colors.white,
      black: colors.black,
    },
    extend: {
      scale: {
        'flip': '-1'
      }
    },
  },
  plugins: [],
};
