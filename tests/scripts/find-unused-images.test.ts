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
});
