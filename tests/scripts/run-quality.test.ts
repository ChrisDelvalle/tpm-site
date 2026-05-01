import { describe, expect, test } from "bun:test";

import {
  formatCommandResult,
  outputHasWarningOrError,
  resultIsBlockingFailure,
  shouldPrintResult,
} from "../../scripts/run-quality";

describe("quality runner", () => {
  test("distinguishes blocking failures from review warnings", () => {
    const blocking = {
      command: { args: ["run", "check"], blocking: true, label: "Check" },
      exitCode: 1,
      output: "failed",
    };
    const review = {
      command: {
        args: ["run", "coverage"],
        blocking: false,
        label: "Coverage",
      },
      exitCode: 1,
      output: "warnings",
    };

    expect(resultIsBlockingFailure(blocking)).toBe(true);
    expect(resultIsBlockingFailure(review)).toBe(false);
    expect(formatCommandResult(review)).toContain("produced review warnings");
  });

  test("prints warning-like output but ignores zero-count summaries", () => {
    expect(outputHasWarningOrError("0 warnings\n0 errors")).toBe(false);
    expect(outputHasWarningOrError("Coverage warning")).toBe(true);
    expect(
      shouldPrintResult({
        command: { args: [], blocking: false, label: "Review" },
        exitCode: 0,
        output: "warning",
      }),
    ).toBe(true);
  });
});
