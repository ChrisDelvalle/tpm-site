import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

interface PackageJson {
  scripts: Record<string, string>;
}

const expectedScriptEntrypoints = [
  ["assets:duplicates", "scripts/assets/find-duplicate-images.ts"],
  ["assets:locations", "scripts/assets/verify-image-asset-locations.ts"],
  ["assets:shared", "scripts/assets/find-shared-assets.ts"],
  ["assets:unused", "scripts/assets/find-unused-images.ts"],
  ["build:optimize", "scripts/build/optimize-build-output.ts"],
  ["catalog:check", "scripts/quality/verify-component-catalog.ts"],
  ["coverage:verify", "scripts/testing/verify-test-coverage.ts"],
  [
    "payload:minify-html:experiment",
    "scripts/payload/minify-html-experiment.ts",
  ],
  [
    "payload:minify-html:experiments",
    "scripts/payload/run-minify-html-experiments.ts",
  ],
  [
    "payload:postbuild:experiments",
    "scripts/payload/run-post-build-optimization-experiments.ts",
  ],
  ["payload:report", "scripts/payload/report-payload.ts"],
  ["payload:vite:experiments", "scripts/payload/run-vite-build-experiments.ts"],
  ["quality", "scripts/quality/run-quality.ts"],
  ["quality:release", "scripts/quality/run-quality.ts"],
  ["test", "scripts/testing/run-tests.ts"],
  ["test:accountability", "scripts/testing/verify-test-accountability.ts"],
  [
    "test:accountability:release",
    "scripts/testing/verify-test-accountability.ts",
  ],
  ["test:astro", "scripts/testing/sync-astro-test-store.ts"],
  ["test:flake", "scripts/testing/run-randomized-tests.ts"],
  ["verify", "scripts/build/verify-build.ts"],
  ["verify:content", "scripts/content/verify-content.ts"],
] as const;

function isPackageJson(value: unknown): value is PackageJson {
  return (
    typeof value === "object" &&
    value !== null &&
    "scripts" in value &&
    typeof value.scripts === "object" &&
    value.scripts !== null
  );
}

async function readPackageJson(): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile("package.json", "utf8"));

  if (!isPackageJson(parsed)) {
    throw new TypeError("package.json does not contain a scripts object.");
  }

  return parsed;
}

describe("package scripts", () => {
  test("point script entrypoints at organized script directories", async () => {
    const packageJson = await readPackageJson();
    const scripts = new Map(Object.entries(packageJson.scripts));

    for (const [scriptName, entrypoint] of expectedScriptEntrypoints) {
      expect(scripts.get(scriptName)).toContain(entrypoint);
      expect(existsSync(entrypoint)).toBe(true);
    }
  });
});
