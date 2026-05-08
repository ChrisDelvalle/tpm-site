import { describe, expect, test } from "bun:test";

import {
  formatPlatformBoundaryReport,
  verifyPlatformBoundaries,
} from "../../../scripts/quality/verify-platform-boundaries";

const ownedLibFiles = [
  "src/lib/routes.ts",
  "src/lib/site-config.ts",
  "src/lib/utils.ts",
].map((path) => ({ path, text: "export const value = true;\n" }));

describe("platform boundary verifier", () => {
  test("passes generic owned platform modules", () => {
    const result = verifyPlatformBoundaries({
      files: [
        ...ownedLibFiles,
        {
          path: "src/layouts/BaseLayout.astro",
          text: '---\nimport "@site/theme.css";\n---\n<slot />\n',
        },
      ],
      rootDir: ".",
    });

    expect(result.unownedLibFiles).toEqual([]);
    expect(result.forbiddenImports).toEqual([]);
    expect(result.forbiddenLiterals).toEqual([]);
    expect(formatPlatformBoundaryReport(result)).toBe(
      "Platform boundary check passed.",
    );
  });

  test("reports unowned src/lib modules", () => {
    const result = verifyPlatformBoundaries({
      files: [
        ...ownedLibFiles,
        {
          path: "src/lib/mystery.ts",
          text: "export const mystery = true;\n",
        },
      ],
      rootDir: ".",
    });

    expect(result.unownedLibFiles).toEqual(["mystery.ts"]);
    expect(formatPlatformBoundaryReport(result)).toContain(
      "Unowned src/lib modules:",
    );
  });

  test("reports site-specific literals in reusable platform code", () => {
    const result = verifyPlatformBoundaries({
      files: [
        ...ownedLibFiles,
        {
          path: "src/components/blocks/Example.astro",
          text: "<p>The Philosopher's Meme</p>\n",
        },
      ],
      rootDir: ".",
    });

    expect(result.forbiddenLiterals).toEqual([
      {
        file: "src/components/blocks/Example.astro",
        message:
          "Move The Philosopher's Meme display copy into the site instance.",
      },
    ]);
  });

  test("reports unsupported site-instance imports", () => {
    const result = verifyPlatformBoundaries({
      files: [
        ...ownedLibFiles,
        {
          path: "src/components/blocks/Example.astro",
          text: '---\nimport image from "@site/assets/example.png";\n---\n',
        },
      ],
      rootDir: ".",
    });

    expect(result.forbiddenImports).toEqual([
      {
        file: "src/components/blocks/Example.astro",
        message:
          'Unsupported site-instance import "@site/assets/example.png". Read site data through config/content adapters or explicit props.',
      },
    ]);
  });
});
