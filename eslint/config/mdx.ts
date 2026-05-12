import * as mdx from "eslint-plugin-mdx";
import type { ConfigWithExtends } from "typescript-eslint";

/**
 * Creates MDX processor rules for article MDX files and code blocks.
 *
 * @returns Flat config blocks for MDX content and virtual code blocks.
 */
export function createMdxConfigs(): readonly ConfigWithExtends[] {
  return [
    {
      ...mdx.flat,
      files: ["**/*.mdx"],
      processor: mdx.createRemarkProcessor({
        lintCodeBlocks: true,
      }),
      rules: {
        ...mdx.flat.rules,
        "mdx/remark": "error",
        "no-irregular-whitespace": "off",
        "no-unused-vars": "off",
      },
      settings: {
        "mdx/code-blocks": true,
      },
    },
    {
      ...mdx.flatCodeBlocks,
      files: ["**/*.mdx/**"],
      rules: {
        ...mdx.flatCodeBlocks.rules,
        "no-var": "error",
        "prefer-const": "error",
      },
    },
  ];
}
