import { describe, expect, spyOn, test } from "bun:test";

import {
  formatCommandResult,
  outputHasWarningOrError,
  type QualityCommand,
  type QualityCommandRunner,
  type QualityOutputLevel,
  resultIsBlockingFailure,
  runQualityCli,
  runQualityWorkflow,
  shouldPrintResult,
} from "../../../scripts/quality/run-quality";

function command(label: string, blocking: boolean): QualityCommand {
  return {
    args: ["run", label],
    blocking,
    label,
  };
}

describe("quality runner", () => {
  test.serial(
    "prints command usage without running quality checks",
    async () => {
      const log = spyOn(console, "log").mockImplementation(() => undefined);

      try {
        const exitCode = await runQualityCli(["--help"], process.cwd());

        expect(exitCode).toBe(0);
        expect(String(log.mock.calls[0]?.[0])).toContain(
          "Usage: bun run quality",
        );
      } finally {
        log.mockRestore();
      }
    },
  );

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

  test("runs commands quietly and reports only actionable output", async () => {
    const reports: Array<{ level: QualityOutputLevel; message: string }> = [];
    const runner: QualityCommandRunner = async (qualityCommand) => {
      await Promise.resolve();

      if (qualityCommand.label === "warning") {
        return {
          command: qualityCommand,
          exitCode: 0,
          output: "1 warning found.",
        };
      }

      if (qualityCommand.label === "blocking") {
        return {
          command: qualityCommand,
          exitCode: 1,
          output: "Typecheck failed.",
        };
      }

      return {
        command: qualityCommand,
        exitCode: 0,
        output: "0 warnings",
      };
    };

    const exitCode = await runQualityWorkflow({
      commands: [
        command("clean", true),
        command("warning", false),
        command("blocking", true),
      ],
      cwd: process.cwd(),
      runner,
      write: (message, level) => {
        reports.push({ level, message });
      },
    });

    expect(exitCode).toBe(1);
    expect(reports).toHaveLength(2);
    expect(reports[0]).toMatchObject({ level: "warn" });
    expect(reports[1]).toMatchObject({ level: "error" });
  });

  test("does not fail when only non-blocking review commands fail", async () => {
    const exitCode = await runQualityWorkflow({
      commands: [command("review", false)],
      cwd: process.cwd(),
      runner: async (qualityCommand) => {
        await Promise.resolve();

        return {
          command: qualityCommand,
          exitCode: 1,
          output: "Review warning.",
        };
      },
      write: () => undefined,
    });

    expect(exitCode).toBe(0);
  });

  test.serial(
    "uses default console writers for visible workflow output",
    async () => {
      const warn = spyOn(console, "warn").mockImplementation(() => undefined);
      const error = spyOn(console, "error").mockImplementation(() => undefined);

      try {
        const exitCode = await runQualityWorkflow({
          commands: [command("warning", false), command("blocking", true)],
          cwd: process.cwd(),
          runner: async (qualityCommand) => {
            await Promise.resolve();

            return {
              command: qualityCommand,
              exitCode: qualityCommand.blocking ? 1 : 0,
              output: qualityCommand.blocking ? "failed" : "1 warning",
            };
          },
        });

        expect(exitCode).toBe(1);
        expect(warn.mock.calls).toHaveLength(1);
        expect(error.mock.calls).toHaveLength(1);
      } finally {
        warn.mockRestore();
        error.mockRestore();
      }
    },
  );

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
