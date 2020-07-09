module.exports = {
  root: true,

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },

  env: {
    browser: true
  },

  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/recommended',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard',
  ],

  // required to lint *.vue files
  plugins: [
    'vue'
  ],

  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    'process': true
  },

  // add your custom rules here
  rules: {
    // allow console.log during development only
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    'comma-dangle': 'off',

    'vue/no-unused-components':  process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'vue/max-attributes-per-line': ["error", {
      "singleline": 3, // instead of 1: one-liners are nice
      "multiline": {
        "max": 1, // default
        "allowFirstLine": false // default
      }
    }]
  }
}
