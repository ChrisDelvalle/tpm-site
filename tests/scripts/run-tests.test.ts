import { describe, expect, test } from "bun:test";

import {
  formatTestCommandResult,
  resultIsFailure,
  runTestWorkflow,
  type TestCommand,
  type TestCommandResult,
} from "../../scripts/run-tests";

function command(label: string): TestCommand {
  return {
    args: ["run", label],
    label,
  };
}

describe("test runner", () => {
  test("formats failing command output with the command line", () => {
    expect(
      formatTestCommandResult({
        command: command("Bun unit tests"),
        exitCode: 1,
        output: "Expected true to be false.",
      }),
    ).toContain("$ bun run Bun unit tests");
  });

  test("detects failing command results", () => {
    expect(
      resultIsFailure({
        command: command("Failing tests"),
        exitCode: 1,
        output: "",
      }),
    ).toBe(true);
  });

  test("runs setup commands before parallel commands", async () => {
    const calls: string[] = [];
    const runner = async (
      testCommand: TestCommand,
    ): Promise<TestCommandResult> => {
      calls.push(testCommand.label);
      await Promise.resolve();

      return {
        command: testCommand,
        exitCode: 0,
        output: "",
      };
    };
    const exitCode = await runTestWorkflow({
      cwd: process.cwd(),
      parallelCommands: [command("unit"), command("astro")],
      runner,
      setupCommands: [command("accountability")],
    });

    expect(exitCode).toBe(0);
    expect(calls.at(0)).toBe("accountability");
    expect(calls.slice(1).sort()).toEqual(["astro", "unit"]);
  });

  test("returns failure when any parallel command fails", async () => {
    const reports: string[] = [];
    const exitCode = await runTestWorkflow({
      cwd: process.cwd(),
      parallelCommands: [command("unit"), command("Astro")],
      runner: async (testCommand) => {
        await Promise.resolve();

        return {
          command: testCommand,
          exitCode: testCommand.label === "Astro" ? 1 : 0,
          output: "failure details",
        };
      },
      setupCommands: [],
      write: (message) => {
        reports.push(message);
      },
    });

    expect(exitCode).toBe(1);
    expect(reports.join("\n")).toContain("Astro");
  });
});
