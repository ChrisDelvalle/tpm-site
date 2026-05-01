import { describe, expect, test } from "bun:test";

import {
  formatDuplicateImageReport,
  globToRegExp,
  groupDuplicateImages,
} from "../../scripts/find-duplicate-images";

describe("duplicate image finder", () => {
  test("groups identical image hashes and ignores unique files", () => {
    expect(
      groupDuplicateImages([
        { hash: "same", path: "src/assets/a.png", size: 1 },
        { hash: "same", path: "unused-assets/a.png", size: 1 },
        { hash: "different", path: "src/assets/b.png", size: 1 },
      ]),
    ).toEqual([
      [
        { hash: "same", path: "src/assets/a.png", size: 1 },
        { hash: "same", path: "unused-assets/a.png", size: 1 },
      ],
    ]);
  });

  test("formats review guidance for duplicate groups", () => {
    expect(
      formatDuplicateImageReport({
        duplicateGroups: [
          [
            { hash: "h", path: "a.png", size: 1 },
            { hash: "h", path: "b.png", size: 1 },
          ],
        ],
        ignoredPatterns: [],
        imageCount: 2,
        scanDirs: ["src/assets"],
      }),
    ).toContain("Duplicate image review warning");
    expect(globToRegExp("src/assets/**/*.png").test("src/assets/a/b.png")).toBe(
      true,
    );
  });
});
