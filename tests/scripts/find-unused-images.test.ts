import { describe, expect, test } from "bun:test";

import {
  formatUnusedImageReport,
  globToRegExp,
} from "../../scripts/find-unused-images";

describe("unused image finder", () => {
  test("formats actionable review output and glob ignore patterns", () => {
    expect(
      formatUnusedImageReport(
        {
          ignoredPatterns: [],
          referencedImageCount: 0,
          scannedImageCount: 1,
          unusedImages: ["src/assets/articles/post/unused.png"],
        },
        "scripts/unused-image-ignore.json",
      ),
    ).toContain("Move it to unused-assets/");
    expect(
      globToRegExp("src/assets/**/*.png").test("src/assets/post/image.png"),
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
    ).toBe("No unused src images found (2 image files scanned, 2 referenced).");
    expect(globToRegExp("src/assets/?.png").test("src/assets/a.png")).toBe(
      true,
    );
    expect(globToRegExp("src/assets/?.png").test("src/assets/ab.png")).toBe(
      false,
    );
  });
});
