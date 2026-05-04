import { describe, expect, test } from "bun:test";

import { formatCoverageInventoryReport } from "../../../scripts/testing/verify-test-coverage";

describe("coverage verifier", () => {
  test("reports unapproved coverage gaps with repair guidance", () => {
    expect(
      formatCoverageInventoryReport({
        approvedExceptionFiles: [],
        coveredFiles: [],
        missingFiles: ["src/scripts/theme.ts"],
        subjectFiles: ["src/scripts/theme.ts"],
      }),
    ).toContain("Add meaningful tests");
  });
});
