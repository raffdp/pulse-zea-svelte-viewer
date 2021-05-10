const production = !process.env.ROLLUP_WATCH

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  plugins: [],
  purge: {
    content: ['./src/**/*.svelte'],
    enabled: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3871c1',
          light: '#2D7CCD',
        },
        secondary: {
          DEFAULT: '#3871c1',
          light: '#2D7CCD',
        },
        background: {
          DEFAULT: '#222222',
          light: '#2d2d2d',
        },
        foreground: {
          dark: '#aaaaaa',
          DEFAULT: '#e0e0e0',
        },
      },
    },
  },
}
