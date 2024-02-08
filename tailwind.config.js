/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: "#1f1f1f",
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      red: "#CF1322",
      blue: colors.blue,
      bg: '#f5f5f5',
      primary: '#663399'
    },
    screens: {
      'sm': '576px',    // Customize 'sm' to match Ant Design's breakpoint
      'md': '768px',    // Customize 'md' to match Ant Design's breakpoint
      'lg': '992px',    // Customize 'lg' to match Ant Design's breakpoint
      'xl': '1200px',   // Customize 'xl' to match Ant Design's breakpoint
      '2xl': '1600px',   // Customize 'xl' to match Ant Design's breakpoint
    },
  },
  plugins: [],
};
