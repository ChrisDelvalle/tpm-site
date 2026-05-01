import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  formatCoverageInventoryReport,
  verifyCoverageInventory,
} from "../../scripts/verify-test-coverage";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-coverage-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function writeText(root: string, relativePath: string, text: string) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, text);
}

describe("coverage inventory verifier", () => {
  test("reports testable source files missing from LCOV", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "coverage/lcov.info", "SF:scripts/covered.ts\n");
      await writeText(
        root,
        "scripts/covered.ts",
        "export const covered = 1;\n",
      );
      await writeText(
        root,
        "scripts/missing.ts",
        "export const missing = 1;\n",
      );
      await writeText(root, "scripts/tool.config.ts", "export default {};\n");

      const result = await verifyCoverageInventory({
        rootDir: root,
        roots: ["scripts"],
      });

      expect(result.missingFiles).toEqual(["scripts/missing.ts"]);
      expect(formatCoverageInventoryReport(result)).toContain(
        "Coverage inventory failed",
      );
    }));

  test("passes when all testable source files are represented", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "coverage/lcov.info", "SF:scripts/covered.ts\n");
      await writeText(
        root,
        "scripts/covered.ts",
        "export const covered = 1;\n",
      );

      const result = await verifyCoverageInventory({
        rootDir: root,
        roots: ["scripts"],
      });

      expect(result.missingFiles).toEqual([]);
      expect(formatCoverageInventoryReport(result)).toContain(
        "Coverage inventory passed",
      );
    }));
});
