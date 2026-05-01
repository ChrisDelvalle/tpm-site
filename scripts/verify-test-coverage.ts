import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const defaultCoverageFile = "coverage/lcov.info";
const defaultRoots = ["scripts", "src/components", "src/lib", "src/pages"];
const coveredFilePattern = /^SF:(.+)$/gm;
const testableFilePattern = /\.(?:ts|tsx)$/;
const ignoredPathSegments = new Set(["node_modules"]);
const ignoredExactFiles = new Set(["src/content.config.ts", "src/env.d.ts"]);

/** Coverage inventory result used by reports and tests. */
export interface CoverageInventoryResult {
  coveredFiles: string[];
  missingFiles: string[];
  testableFiles: string[];
}

/** Inputs needed to verify unit-test coverage inventory. */
export interface CoverageVerificationOptions {
  coverageFile?: string;
  rootDir: string;
  roots?: string[];
}

/**
 * Formats coverage inventory findings for local and CI output.
 *
 * @param result Coverage inventory result.
 * @returns Human-readable coverage inventory report.
 */
export function formatCoverageInventoryReport(
  result: CoverageInventoryResult,
): string {
  if (result.missingFiles.length === 0) {
    return `Coverage inventory passed: ${result.testableFiles.length} testable source files are represented in LCOV.`;
  }

  return [
    `Coverage inventory failed: ${result.missingFiles.length} testable source file${
      result.missingFiles.length === 1 ? "" : "s"
    } missing from LCOV.`,
    "",
    "Add focused unit tests for these files, or exclude the file only if it is config/declarative glue that should not be unit-covered.",
    "",
    ...result.missingFiles.map((file) => `- ${file}`),
  ].join("\n");
}

/**
 * Runs the coverage inventory command-line workflow.
 *
 * @param args Command-line arguments without the executable prefix.
 * @param rootDir Repository root to verify from.
 * @returns Process exit code.
 */
export async function runCoverageVerificationCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: bun run coverage:verify [--quiet]

Verify that every testable TypeScript source file appears in coverage/lcov.info.
Config files, declaration files, Astro templates, and browser-only entrypoint
scripts are intentionally outside this unit-coverage inventory.`);
    return 0;
  }

  const quiet = args.includes("--quiet");
  const result = await verifyCoverageInventory({ rootDir });
  const report = formatCoverageInventoryReport(result);

  if (result.missingFiles.length > 0) {
    console.error(report);
    return 1;
  }

  if (!quiet) {
    console.log(report);
  }

  return 0;
}

/**
 * Verifies that every testable source file is represented in LCOV output.
 *
 * @param options Repository root, coverage file, and source roots.
 * @param options.coverageFile Relative path to the LCOV report.
 * @param options.rootDir Repository root.
 * @param options.roots Source roots to inventory.
 * @returns Coverage inventory result.
 */
export async function verifyCoverageInventory({
  coverageFile = defaultCoverageFile,
  rootDir,
  roots = defaultRoots,
}: CoverageVerificationOptions): Promise<CoverageInventoryResult> {
  const coveredFiles = parseCoveredFiles(
    await readFile(path.resolve(rootDir, coverageFile), "utf8"),
    rootDir,
  );
  const covered = new Set(coveredFiles);
  const testableFiles = (
    await Promise.all(
      roots.map(async (root) =>
        listTestableFiles(rootDir, path.resolve(rootDir, root)),
      ),
    )
  )
    .flat()
    .sort((left, right) => left.localeCompare(right));

  return {
    coveredFiles,
    missingFiles: testableFiles.filter((file) => !covered.has(file)),
    testableFiles,
  };
}

function isIgnored(relativePath: string): boolean {
  if (ignoredExactFiles.has(relativePath)) {
    return true;
  }

  if (relativePath.endsWith(".config.ts") || relativePath.endsWith(".d.ts")) {
    return true;
  }

  if (relativePath.startsWith("src/scripts/")) {
    return true;
  }

  return relativePath
    .split("/")
    .some((segment) => ignoredPathSegments.has(segment));
}

async function listTestableFiles(
  rootDir: string,
  dir: string,
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = toPosix(path.relative(rootDir, fullPath));

    if (entry.isDirectory()) {
      if (!isIgnored(relativePath)) {
        files.push(...(await listTestableFiles(rootDir, fullPath)));
      }
    } else if (
      testableFilePattern.test(entry.name) &&
      !isIgnored(relativePath)
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

function parseCoveredFiles(lcov: string, rootDir: string): string[] {
  return Array.from(lcov.matchAll(coveredFilePattern), (match) => {
    const file = match[1] ?? "";
    const relativePath = path.isAbsolute(file)
      ? path.relative(rootDir, file)
      : file;

    return toPosix(relativePath);
  }).sort((left, right) => left.localeCompare(right));
}

function toPosix(file: string): string {
  return file.split(path.sep).join("/");
}

if (import.meta.main) {
  try {
    process.exitCode = await runCoverageVerificationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
