import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  findDuplicateImages,
  formatDuplicateImageReport,
} from "../../scripts/find-duplicate-images";
import { findSharedAssets } from "../../scripts/find-shared-assets";
import {
  findUnusedImages,
  formatUnusedImageReport,
} from "../../scripts/find-unused-images";
import { verifyContent } from "../../scripts/verify-content";
import {
  formatImageAssetLocationReport,
  verifyImageAssetLocations,
} from "../../scripts/verify-image-asset-locations";

async function runGit(root: string, args: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: root,
      stdio: ["ignore", "ignore", "pipe"],
    });
    const chunks: Buffer[] = [];

    child.stderr.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(Buffer.concat(chunks).toString("utf8")));
    });
  });
}

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-script-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function writeBytes(root: string, relativePath: string, bytes: Buffer) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, bytes);
}

async function writeText(root: string, relativePath: string, text: string) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, text);
}

describe("content verification script", () => {
  test("reports unsafe category names and duplicate article slugs", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/Bad Name.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/same.md",
        "---\ntitle: One\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/politics/same.md",
        "---\ntitle: Two\n---\n",
      );

      const result = await verifyContent({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        rootDir: root,
      });

      expect(result.issues).toContain(
        "src/content/categories/Bad Name.json: category metadata filename is not URL-safe",
      );
      expect(
        result.issues.some((issue) =>
          issue.includes('duplicate article slug "same"'),
        ),
      ).toBe(true);
    }));

  test("counts drafts without requiring article count edits", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/draft.md",
        "---\ntitle: Draft\ndraft: true\n---\n",
      );

      const result = await verifyContent({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        rootDir: root,
      });

      expect(result.draftCount).toBe(1);
      expect(result.publishedCount).toBe(1);
      expect(result.issues).toEqual([]);
    }));
});

describe("image asset location script", () => {
  test("reports images outside src/assets with repair guidance", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "scripts/image-asset-location-ignore.json", "[]");
      await writeBytes(root, "src/assets/site/ok.png", Buffer.from("ok"));
      await writeBytes(root, "public/leaked.png", Buffer.from("bad"));

      const result = await verifyImageAssetLocations({
        isGitIgnored: () => false,
        rootDir: root,
      });

      expect(result.violations).toEqual(["public/leaked.png"]);
      expect(formatImageAssetLocationReport(result)).toContain(
        "Move each file into the appropriate source asset folder",
      );
    }));

  test("honors explicit image location ignore patterns", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "scripts/image-asset-location-ignore.json",
        JSON.stringify(["public/allowed.png"]),
      );
      await writeBytes(root, "public/allowed.png", Buffer.from("ok"));

      const result = await verifyImageAssetLocations({
        isGitIgnored: () => false,
        rootDir: root,
      });

      expect(result.violations).toEqual([]);
    }));

  test("skips gitignored image paths with one batched git lookup", async () =>
    withTempRoot(async (root) => {
      await runGit(root, ["init"]);
      await writeText(root, ".gitignore", "ignored-assets/\n");
      await writeText(root, "scripts/image-asset-location-ignore.json", "[]");
      await writeBytes(root, "ignored-assets/ignored.png", Buffer.from("ok"));
      await writeBytes(root, "public/leaked.png", Buffer.from("bad"));

      const result = await verifyImageAssetLocations({ rootDir: root });

      expect(result.violations).toEqual(["public/leaked.png"]);
    }));
});

describe("duplicate image script", () => {
  test("finds identical images and prints review guidance", async () =>
    withTempRoot(async (root) => {
      const bytes = Buffer.from("same-image");
      await writeBytes(root, "src/assets/articles/post/a.png", bytes);
      await writeBytes(root, "unused-assets/a-copy.png", bytes);

      const result = await findDuplicateImages({
        ignorePatterns: [],
        rootDir: root,
      });

      expect(result.duplicateGroups).toHaveLength(1);
      expect(formatDuplicateImageReport(result)).toContain(
        "Duplicate image review warning",
      );
      expect(formatDuplicateImageReport(result)).toContain(
        "scripts/duplicate-image-ignore.json",
      );
    }));

  test("honors duplicate image ignore patterns", async () =>
    withTempRoot(async (root) => {
      const bytes = Buffer.from("same-image");
      await writeBytes(root, "src/assets/articles/post/a.png", bytes);
      await writeBytes(root, "unused-assets/a-copy.png", bytes);

      const result = await findDuplicateImages({
        ignorePatterns: ["unused-assets/**"],
        rootDir: root,
      });

      expect(result.duplicateGroups).toEqual([]);
    }));
});

describe("unused image script", () => {
  test("reports images in src/assets that no source file references", async () =>
    withTempRoot(async (root) => {
      await writeBytes(
        root,
        "src/assets/articles/post/used.png",
        Buffer.from("x"),
      );
      await writeBytes(
        root,
        "src/assets/articles/post/unused.png",
        Buffer.from("y"),
      );
      await writeText(
        root,
        "src/content/articles/post/example.md",
        "![Used image](../../../assets/articles/post/used.png)",
      );

      const result = await findUnusedImages({
        ignorePatterns: [],
        rootDir: root,
      });

      expect(result.unusedImages).toEqual([
        "src/assets/articles/post/unused.png",
      ]);
      expect(formatUnusedImageReport(result)).toContain(
        "Move it to unused-assets/",
      );
    }));

  test("honors unused image ignore patterns", async () =>
    withTempRoot(async (root) => {
      await writeBytes(
        root,
        "src/assets/articles/post/unused.png",
        Buffer.from("y"),
      );

      const result = await findUnusedImages({
        ignorePatterns: ["src/assets/articles/post/unused.png"],
        rootDir: root,
      });

      expect(result.unusedImages).toEqual([]);
    }));
});

describe("shared asset script", () => {
  test("reports assets referenced from multiple source files outside shared", async () =>
    withTempRoot(async (root) => {
      await writeBytes(
        root,
        "src/assets/articles/post/shared.png",
        Buffer.from("x"),
      );
      await writeText(
        root,
        "src/pages/one.astro",
        '---\nconst img = "src/assets/articles/post/shared.png";\n---\n',
      );
      await writeText(
        root,
        "src/pages/two.astro",
        '---\nconst img = "src/assets/articles/post/shared.png";\n---\n',
      );

      const result = await findSharedAssets({ rootDir: root });

      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]?.assetPath.endsWith("shared.png")).toBe(true);
    }));

  test("allows assets referenced from multiple files when they live in shared", async () =>
    withTempRoot(async (root) => {
      await writeBytes(root, "src/assets/shared/shared.png", Buffer.from("x"));
      await writeText(
        root,
        "src/pages/one.astro",
        '---\nconst img = "src/assets/shared/shared.png";\n---\n',
      );
      await writeText(
        root,
        "src/pages/two.astro",
        '---\nconst img = "src/assets/shared/shared.png";\n---\n',
      );

      const result = await findSharedAssets({ rootDir: root });

      expect(result.violations).toEqual([]);
    }));
});
