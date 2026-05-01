import { describe, expect, test } from "bun:test";

import {
  formatTestAccountabilityReport,
  parseAccountabilityIgnore,
  verifyTestAccountability,
} from "../../scripts/verify-test-accountability";

describe("test accountability verifier", () => {
  test("requires meaningful comments directly above ignore patterns", () => {
    const parsed = parseAccountabilityIgnore(`# Too short
src/assets/**

# Requested permission: Static assets are covered by asset quality checks.
public/**
`);

    expect(parsed.invalidRules).toHaveLength(1);
    expect(parsed.rules.at(1)?.requestedPermission).toBe(true);
  });

  test("reuses a meaningful comment for contiguous ignore-pattern groups", () => {
    const parsed =
      parseAccountabilityIgnore(`# Requested permission: Static assets are covered by repository asset checks.
src/assets/**
public/**
`);

    expect(parsed.invalidRules).toEqual([]);
    expect(parsed.rules.map((rule) => rule.reason)).toEqual([
      "Requested permission: Static assets are covered by repository asset checks.",
      "Requested permission: Static assets are covered by repository asset checks.",
    ]);
  });

  test("accounts for approved ignore entries without release blockers", async () => {
    const result = await verifyTestAccountability({
      files: [
        ".test-accountability-ignore",
        "scripts/example.ts",
        "src/assets/example.png",
        "tests/scripts/example.test.ts",
      ],
      rootDir: process.cwd(),
    });

    expect(result.missingMirrors).toEqual([]);
    expect(result.requestedPermissionRules).toEqual([]);
    expect(formatTestAccountabilityReport(result, true)).not.toContain(
      "Requested-permission accountability exceptions",
    );
  });

  test("fails files that are neither mirrored nor explicitly accounted for", async () => {
    const result = await verifyTestAccountability({
      files: [".test-accountability-ignore", "src/lib/uncovered.ts"],
      rootDir: process.cwd(),
    });

    expect(result.missingMirrors).toEqual([
      {
        expected: ["tests/src/lib/uncovered.test.ts"],
        file: "src/lib/uncovered.ts",
      },
    ]);
  });
});
