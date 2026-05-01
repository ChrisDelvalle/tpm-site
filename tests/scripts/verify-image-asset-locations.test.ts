import { describe, expect, test } from "bun:test";

import {
  formatImageAssetLocationReport,
  globToRegExp,
} from "../../scripts/verify-image-asset-locations";

describe("image asset location verifier", () => {
  test("formats repair guidance and supports glob ignores", () => {
    expect(
      formatImageAssetLocationReport({
        ignoredPatterns: [],
        imageCount: 1,
        violations: ["public/image.png"],
      }),
    ).toContain("Move each file into the appropriate source asset folder");
    expect(globToRegExp("public/**/*.png").test("public/images/a.png")).toBe(
      true,
    );
    expect(globToRegExp("public/?.png").test("public/a.png")).toBe(true);
  });
});
