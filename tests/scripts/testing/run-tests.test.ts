import { describe, expect, spyOn, test } from "bun:test";

import {
  formatTestCommandResult,
  resultIsFailure,
  runTestsCli,
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
  test.serial("prints command usage without running tests", async () => {
    const log = spyOn(console, "log").mockImplementation(() => undefined);

    try {
      const exitCode = await runTestsCli(["--help"], process.cwd());

      expect(exitCode).toBe(0);
      expect(String(log.mock.calls[0]?.[0])).toContain("Usage: bun run test");
    } finally {
      log.mockRestore();
    }
  });

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

  test("stops before parallel tests when setup fails", async () => {
    const calls: string[] = [];
    const reports: string[] = [];
    const exitCode = await runTestWorkflow({
      cwd: process.cwd(),
      parallelCommands: [command("unit")],
      runner: async (testCommand) => {
        calls.push(testCommand.label);
        await Promise.resolve();

        return {
          command: testCommand,
          exitCode: 1,
          output: "accountability failed",
        };
      },
      setupCommands: [command("accountability")],
      write: (message) => {
        reports.push(message);
      },
    });

    expect(exitCode).toBe(1);
    expect(calls).toEqual(["accountability"]);
    expect(reports.join("\n")).toContain("accountability failed");
  });

  test("prints passing command output in verbose mode", async () => {
    const reports: string[] = [];
    const exitCode = await runTestWorkflow({
      cwd: process.cwd(),
      parallelCommands: [command("unit")],
      runner: async (testCommand) => {
        await Promise.resolve();

        return {
          command: testCommand,
          exitCode: 0,
          output: `${testCommand.label} output`,
        };
      },
      setupCommands: [command("accountability")],
      verbose: true,
      write: (message) => {
        reports.push(message);
      },
    });

    expect(exitCode).toBe(0);
    expect(reports).toEqual(["accountability output", "unit output"]);
  });

  test.serial(
    "uses default console writers for verbose and failure output",
    async () => {
      const log = spyOn(console, "log").mockImplementation(() => undefined);
      const error = spyOn(console, "error").mockImplementation(() => undefined);

      try {
        const exitCode = await runTestWorkflow({
          cwd: process.cwd(),
          parallelCommands: [command("unit")],
          runner: async (testCommand) => {
            await Promise.resolve();

            return {
              command: testCommand,
              exitCode: testCommand.label === "unit" ? 1 : 0,
              output: `${testCommand.label} output`,
            };
          },
          setupCommands: [command("accountability")],
          verbose: true,
        });

        expect(exitCode).toBe(1);
        expect(log.mock.calls).toHaveLength(1);
        expect(error.mock.calls).toHaveLength(1);
      } finally {
        log.mockRestore();
        error.mockRestore();
      }
    },
  );

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
