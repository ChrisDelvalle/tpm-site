import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import type { ConfigWithExtends } from "typescript-eslint";

const legacyGlobalClasses = [
  "archive-list",
  "archive-meta",
  "archive-title",
  "article",
  "article-meta",
  "brand",
  "button",
  "button-row",
  "category-card",
  "category-grid",
  "category-group",
  "category-nav",
  "content-section",
  "eyebrow",
  "header-left",
  "header-nav-actions",
  "header-right",
  "header-support",
  "home-hero",
  "layout-grid",
  "lede",
  "mobile-category-nav",
  "mobile-menu",
  "mobile-menu-close",
  "mobile-menu-nav-actions",
  "mobile-menu-open",
  "mobile-menu-panel",
  "mobile-menu-search",
  "mobile-menu-support",
  "mobile-primary-nav",
  "mobile-search-box",
  "page-heading",
  "primary-nav",
  "search-box",
  "search-page-input",
  "search-result",
  "search-results",
  "secondary",
  "sidebar",
  "site-footer",
  "site-header",
  "site-shell",
  "skip-link",
  "theme-toggle",
  "theme-toggle-dark",
  "theme-toggle-light",
];

/**
 * Creates Tailwind correctness and project visual-direction rules.
 *
 * @returns Flat config blocks for Tailwind class validation.
 */
export function createTailwindConfigs(): readonly ConfigWithExtends[] {
  return [
    {
      ...betterTailwindcss.configs["correctness-error"],
      files: ["src/**/*.{astro,ts,tsx}"],
      rules: {
        ...betterTailwindcss.configs["correctness-error"].rules,
        "better-tailwindcss/no-deprecated-classes": "error",
        "better-tailwindcss/no-duplicate-classes": "error",
        "better-tailwindcss/no-unknown-classes": [
          "error",
          {
            ignore: legacyGlobalClasses,
          },
        ],
        "better-tailwindcss/no-restricted-classes": [
          "error",
          {
            restrict: [
              {
                message:
                  "Gradients are not part of the current visual direction unless explicitly approved.",
                pattern: "^(.*:)?(bg|from|via|to)-.*gradient.*$",
              },
              {
                message:
                  "Use semantic color tokens in project UI instead of raw Tailwind palette colors.",
                pattern:
                  "^(.*:)?(bg|text|border|ring|outline|decoration|accent|caret|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(\\/\\d{1,3})?$",
              },
              {
                message:
                  "Avoid arbitrary pixel values in components. Prefer Tailwind tokens, rems, percentages, or named design tokens.",
                pattern: "^.*\\[[^\\]]*\\d+(?:\\.\\d+)?px[^\\]]*\\].*$",
              },
            ],
          },
        ],
      },
      settings: {
        "better-tailwindcss": {
          entryPoint: "src/styles/global.css",
          messageStyle: "compact",
          tsconfig: "tsconfig.json",
        },
      },
    },
  ];
}
