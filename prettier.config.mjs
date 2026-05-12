/** @type {import("prettier").Config} */
const config = {
  endOfLine: "lf",
  overrides: [
    {
      files: ["*.json", "*.jsonc", "*.yaml", "*.yml"],
      options: {
        trailingComma: "none",
      },
    },
  ],
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
};

export default config;
