const config = {
  mode: "jit",
  purge: [
    "./src/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      'garden',
    ],
  },
  plugins: [
    require('daisyui'),
  ],
};

module.exports = config;
