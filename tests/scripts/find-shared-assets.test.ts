import { describe, expect, test } from "bun:test";

import {
  formatSharedAssetReport,
  normalizeReference,
  resolveAssetReference,
  sharedAssetViolations,
} from "../../scripts/find-shared-assets";

describe("shared asset finder", () => {
  test("normalizes and resolves source asset references", () => {
    expect(normalizeReference("./image.png?raw")).toBe("./image.png");
    expect(
      resolveAssetReference(
        "/repo/src/content/articles/post.md",
        "../../assets/articles/post/image.png",
        "/repo",
        "/repo/src/assets",
      ),
    ).toBe("/repo/src/assets/articles/post/image.png");
  });

  test("reports assets shared outside the shared asset folder", () => {
    const violations = sharedAssetViolations(
      new Map([
        [
          "/repo/src/assets/articles/post/image.png",
          [
            {
              assetPath: "/repo/src/assets/articles/post/image.png",
              file: "/repo/src/content/a.md",
              line: 1,
              value: "image.png",
            },
            {
              assetPath: "/repo/src/assets/articles/post/image.png",
              file: "/repo/src/content/b.md",
              line: 2,
              value: "image.png",
            },
          ],
        ],
      ]),
      "/repo/src/assets/shared",
    );

    expect(violations).toHaveLength(1);
    expect(
      formatSharedAssetReport(
        {
          referenceCount: 2,
          referencedAssetCount: 1,
          violations,
        },
        "/repo",
      ),
    ).toContain("outside src/assets/shared/");
  });
});
