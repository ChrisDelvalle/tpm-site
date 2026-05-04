import path from "node:path";

import {
  optimizeBuildOutput,
  productionBuildOutputTransforms,
} from "./build-output-optimizer";

/** Options for the production generated-output optimization CLI. */
export interface OptimizeBuildOutputCliOptions {
  outputDir: string;
  quiet: boolean;
}

/**
 * Runs the production generated-output optimization CLI.
 *
 * @param args Command-line arguments without executable prefix.
 * @param cwd Repository root.
 * @returns Process exit code.
 */
export function runOptimizeBuildOutputCli(
  args = process.argv.slice(2),
  cwd = process.cwd(),
): number {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return 0;
  }

  try {
    const options = parseOptions(args, cwd);
    const result = optimizeBuildOutput({
      outputDir: options.outputDir,
      transforms: productionBuildOutputTransforms,
    });

    if (!options.quiet) {
      console.log(
        `Optimized generated output: ${result.cssFiles} CSS, ${result.jsFiles} JS, ${result.svgFiles} SVG files.`,
      );
    }

    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function parseOptions(
  args: string[],
  cwd: string,
): OptimizeBuildOutputCliOptions {
  return {
    outputDir: path.resolve(cwd, readValueArg(args, "--dir") ?? "dist"),
    quiet: args.includes("--quiet"),
  };
}

function readValueArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function usage(): string {
  return `Usage: bun run build:optimize [--dir <dir>] [--quiet]

Apply the production generated-output optimization stack to an existing static
build directory. The production stack is Lightning CSS, SVGO, and conservative
Oxc JavaScript whitespace optimization.

Default directory: dist`;
}

if (import.meta.main) {
  try {
    process.exitCode = runOptimizeBuildOutputCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
