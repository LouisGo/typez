/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  singleQuote: true,
  semi: false,
  printWidth: 100,
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/renderer/src/styles/globals.css',
  tailwindFunctions: ['cn']
}
