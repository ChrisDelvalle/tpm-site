import { describe, expect, test } from "bun:test";

import {
  formatUnusedImageReport,
  globToRegExp,
} from "../../../scripts/assets/find-unused-images";

describe("unused image finder", () => {
  test("formats actionable review output and glob ignore patterns", () => {
    expect(
      formatUnusedImageReport(
        {
          ignoredPatterns: [],
          referencedImageCount: 0,
          scannedImageCount: 1,
          unusedImages: ["site/assets/articles/post/unused.png"],
        },
        "scripts/unused-image-ignore.json",
      ),
    ).toContain("Move it to site/unused-assets/");
    expect(
      globToRegExp("site/assets/**/*.png").test("site/assets/post/image.png"),
    ).toBe(true);
  });

  test("formats success output and supports single-character globs", () => {
    expect(
      formatUnusedImageReport({
        ignoredPatterns: [],
        referencedImageCount: 2,
        scannedImageCount: 2,
        unusedImages: [],
      }),
    ).toBe(
      "No unused site images found (2 image files scanned, 2 referenced).",
    );
    expect(globToRegExp("site/assets/?.png").test("site/assets/a.png")).toBe(
      true,
    );
    expect(globToRegExp("site/assets/?.png").test("site/assets/ab.png")).toBe(
      false,
    );
  });
});
