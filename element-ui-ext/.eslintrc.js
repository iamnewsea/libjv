module.exports = {
  root: true,
  env: {
    "browser": true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off', //  error
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    // "space-before-function-paren": [0, "always"],
    // "semi": [0, "always"]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
