import { spawn } from "node:child_process";

/** Command run by the test dispatcher. */
export interface TestCommand {
  args: string[];
  label: string;
}

/** Captured result for one test command. */
export interface TestCommandResult {
  command: TestCommand;
  exitCode: number;
  output: string;
}

/** Dependency-injected command runner for tests. */
export type TestCommandRunner = (
  command: TestCommand,
  cwd: string,
) => Promise<TestCommandResult>;

/** Options for running the repository test workflow. */
export interface TestWorkflowOptions {
  cwd: string;
  parallelCommands?: TestCommand[];
  runner?: TestCommandRunner;
  setupCommands?: TestCommand[];
  verbose?: boolean;
  write?: (message: string, error: boolean) => void;
}

const defaultSetupCommands: TestCommand[] = [
  {
    args: ["--silent", "run", "test:accountability"],
    label: "Test accountability",
  },
];

const defaultParallelCommands: TestCommand[] = [
  {
    args: ["--silent", "run", "test:unit"],
    label: "Bun unit tests",
  },
  {
    args: ["--silent", "run", "test:astro"],
    label: "Astro component tests",
  },
];

/**
 * Formats one test command result for actionable failure output.
 *
 * @param result Captured command result.
 * @returns Human-readable test command report.
 */
export function formatTestCommandResult(result: TestCommandResult): string {
  const output = result.output.trim();
  return [
    `[test] ${result.command.label} failed with exit code ${result.exitCode}`,
    `$ ${commandLine(result.command)}`,
    output === "" ? undefined : output,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/**
 * Checks whether a test command failed.
 *
 * @param result Captured command result.
 * @returns True when the command exited unsuccessfully.
 */
export function resultIsFailure(result: TestCommandResult): boolean {
  return result.exitCode !== 0;
}

/**
 * Runs the repository test command-line workflow.
 *
 * @param args Command-line arguments without the executable prefix.
 * @param cwd Working directory for Bun subprocesses.
 * @returns Process exit code.
 */
export async function runTestsCli(
  args = process.argv.slice(2),
  cwd = process.cwd(),
): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return 0;
  }

  return runTestWorkflow({
    cwd,
    verbose: args.includes("--verbose"),
  });
}

/**
 * Runs setup test commands sequentially, then independent test suites in
 * parallel.
 *
 * @param options Test workflow options.
 * @param options.cwd Working directory for commands.
 * @param options.parallelCommands Commands that can run concurrently.
 * @param options.runner Command runner dependency.
 * @param options.setupCommands Commands that must finish before parallel work.
 * @param options.verbose Whether passing command output should be printed.
 * @param options.write Output sink for command reports.
 * @returns Process exit code.
 */
export async function runTestWorkflow({
  cwd,
  parallelCommands = defaultParallelCommands,
  runner = runCommand,
  setupCommands = defaultSetupCommands,
  verbose = false,
  write = defaultWrite,
}: TestWorkflowOptions): Promise<number> {
  for (const command of setupCommands) {
    const result = await runner(command, cwd);

    if (resultIsFailure(result)) {
      write(formatTestCommandResult(result), true);
      return 1;
    }

    if (verbose && result.output.trim() !== "") {
      write(result.output.trim(), false);
    }
  }

  const results = await Promise.all(
    parallelCommands.map(async (command) => runner(command, cwd)),
  );

  for (const result of results) {
    if (resultIsFailure(result)) {
      write(formatTestCommandResult(result), true);
    } else if (verbose && result.output.trim() !== "") {
      write(result.output.trim(), false);
    }
  }

  return results.some(resultIsFailure) ? 1 : 0;
}

function commandEnvironment(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  env["NO_COLOR"] = "1";
  delete env["FORCE_COLOR"];
  return env;
}

function commandLine(command: TestCommand): string {
  return ["bun", ...command.args].join(" ");
}

function defaultWrite(message: string, error: boolean): void {
  if (error) {
    console.error(message);
    return;
  }

  console.log(message);
}

async function runCommand(
  command: TestCommand,
  cwd: string,
): Promise<TestCommandResult> {
  return new Promise<TestCommandResult>((resolve) => {
    const child = spawn("bun", command.args, {
      cwd,
      env: commandEnvironment(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    const chunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    child.on("error", (error) => {
      resolve({
        command,
        exitCode: 1,
        output: error.message,
      });
    });
    child.on("close", (code) => {
      resolve({
        command,
        exitCode: code ?? 1,
        output: Buffer.concat(chunks).toString("utf8"),
      });
    });
  });
}

function usage(): string {
  return `Usage: bun run test [--verbose]

Run test accountability first, then run Bun unit tests and Astro component
tests concurrently. Passing commands stay quiet unless --verbose is used.`;
}

if (import.meta.main) {
  try {
    process.exitCode = await runTestsCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
