import { describe, expect, test } from "bun:test";

import {
  formatDuplicateImageReport,
  globToRegExp,
  groupDuplicateImages,
} from "../../../scripts/assets/find-duplicate-images";

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

  test("formats success output and supports single-character globs", () => {
    expect(
      formatDuplicateImageReport({
        duplicateGroups: [],
        ignoredPatterns: [],
        imageCount: 3,
        scanDirs: ["src/assets"],
      }),
    ).toBe("No duplicate images found across 3 image files.");
    expect(globToRegExp("src/assets/?.png").test("src/assets/a.png")).toBe(
      true,
    );
    expect(globToRegExp("src/assets/?.png").test("src/assets/ab.png")).toBe(
      false,
    );
  });

  test("sorts duplicate groups by size and path for stable reports", () => {
    expect(
      groupDuplicateImages([
        { hash: "small", path: "src/assets/z.png", size: 1 },
        { hash: "large", path: "src/assets/b.png", size: 10 },
        { hash: "small", path: "src/assets/y.png", size: 1 },
        { hash: "large", path: "src/assets/a.png", size: 10 },
        { hash: "large-two", path: "src/assets/c.png", size: 10 },
        { hash: "large-two", path: "src/assets/d.png", size: 10 },
      ]).map((group) => group.map((record) => record.path)),
    ).toEqual([
      ["src/assets/b.png", "src/assets/a.png"],
      ["src/assets/c.png", "src/assets/d.png"],
      ["src/assets/z.png", "src/assets/y.png"],
    ]);
  });
});
