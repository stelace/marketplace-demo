module.exports = {
  plugins: [
    'lodash'
  ],
  presets: [
    ['@quasar/babel-preset-app', {
      presetEnv: { corejs: 3 }
    }]
  ]
}
