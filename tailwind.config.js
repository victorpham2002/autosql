/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './component/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
    colors: {
      ...colors,
      'logo' : '#CC4125',
      'background' : '#FFCECE',
      'button' : '#FF7979',
      transparent: 'transparent',
      current: 'currentColor',
    },
  },
  plugins: [],
}

