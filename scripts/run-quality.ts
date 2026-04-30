import { spawn } from "node:child_process";

interface QualityCommand {
  args: string[];
  blocking: boolean;
  label: string;
}

interface CommandResult {
  command: QualityCommand;
  exitCode: number;
  output: string;
}

const localCommands: QualityCommand[] = [
  {
    args: ["--silent", "run", "check"],
    blocking: true,
    label: "Normal quality gate",
  },
  {
    args: ["--silent", "run", "build"],
    blocking: true,
    label: "Production build",
  },
  {
    args: ["--silent", "run", "verify"],
    blocking: true,
    label: "Build verification",
  },
  {
    args: ["--silent", "run", "validate:html"],
    blocking: true,
    label: "HTML validation",
  },
  {
    args: ["--silent", "run", "review:assets"],
    blocking: false,
    label: "Asset review",
  },
  {
    args: ["--silent", "run", "review:markdown"],
    blocking: false,
    label: "Markdown review",
  },
];

const releaseCommands: QualityCommand[] = [
  {
    args: ["--silent", "run", "check:release"],
    blocking: true,
    label: "Release quality gate",
  },
  {
    args: ["--silent", "run", "review:assets"],
    blocking: false,
    label: "Asset review",
  },
  {
    args: ["--silent", "run", "review:markdown"],
    blocking: false,
    label: "Markdown review",
  },
  {
    args: ["--silent", "run", "test:a11y"],
    blocking: false,
    label: "Accessibility review",
  },
  {
    args: ["--silent", "run", "test:perf"],
    blocking: false,
    label: "Lighthouse review",
  },
  {
    args: ["--silent", "run", "coverage"],
    blocking: false,
    label: "Coverage review",
  },
  {
    args: ["--silent", "run", "audit:all"],
    blocking: false,
    label: "All-severity dependency audit review",
  },
];

function commandLine(command: QualityCommand) {
  return ["bun", ...command.args].join(" ");
}

export function outputHasWarningOrError(output: string) {
  return output.split(/\r?\n/).some((line) => {
    if (line.trimStart().startsWith("$ ")) {
      return false;
    }

    const lineWithoutZeroCounts = line
      .replace(/\b(?:0|no)\s+(?:errors?|failures?|warnings?|warns?)\b/gi, "")
      .replace(/\b(?:errors?|failures?|warnings?|warns?)\s*[:=]\s*0\b/gi, "");

    return /\b(?:errors?|failed|failures?|fatal|warnings?|warns?)\b|[✖✗]/i.test(
      lineWithoutZeroCounts,
    );
  });
}

export function shouldPrintResult(result: CommandResult) {
  return result.exitCode !== 0 || outputHasWarningOrError(result.output);
}

export function resultIsBlockingFailure(result: CommandResult) {
  return result.command.blocking && result.exitCode !== 0;
}

export function formatCommandResult(result: CommandResult) {
  const status =
    result.exitCode === 0
      ? "produced warnings"
      : result.command.blocking
        ? `failed with exit code ${result.exitCode}`
        : `produced review warnings with exit code ${result.exitCode}`;
  const output = result.output.trim();

  return [
    `[quality] ${result.command.label} ${status}`,
    `$ ${commandLine(result.command)}`,
    output === "" ? undefined : output,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function commandEnvironment() {
  const env = { ...process.env };
  env["NO_COLOR"] = "1";
  delete env["FORCE_COLOR"];
  return env;
}

async function runCommand(command: QualityCommand, cwd: string) {
  return new Promise<CommandResult>((resolve) => {
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

function selectedCommands(args: string[]) {
  return args.includes("--release") ? releaseCommands : localCommands;
}

function usage() {
  return `Usage: bun run quality [--release]

Run quality checks quietly. Passing commands stay silent. Commands that fail or
emit warnings print their captured output.

Default mode runs the local PR-quality path: check, build, verify,
validate:html, review:assets, and review:markdown.

Use --release to run check:release plus non-blocking Markdown, asset,
accessibility, Lighthouse, coverage, and all-severity audit review checks.`;
}

export async function runQualityCli(
  args = process.argv.slice(2),
  cwd = process.cwd(),
) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return 0;
  }

  const results: CommandResult[] = [];

  for (const command of selectedCommands(args)) {
    const result = await runCommand(command, cwd);
    results.push(result);

    if (shouldPrintResult(result)) {
      const formatted = formatCommandResult(result);
      if (result.exitCode === 0) {
        console.warn(formatted);
      } else {
        console.error(formatted);
      }
    }
  }

  return results.some(resultIsBlockingFailure) ? 1 : 0;
}

if (import.meta.main) {
  try {
    process.exitCode = await runQualityCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
