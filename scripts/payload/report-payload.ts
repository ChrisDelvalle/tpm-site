import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

/** One measured file from built output. */
export interface PayloadFile {
  brotliBytes: number | undefined;
  extension: string;
  gzipBytes: number | undefined;
  path: string;
  rawBytes: number;
}

/** Aggregated payload data for a group of files. */
export interface PayloadGroup {
  brotliBytes: number | undefined;
  extension: string;
  files: number;
  gzipBytes: number | undefined;
  rawBytes: number;
}

/** Complete generated-output payload report. */
export interface PayloadReport {
  allFiles: PayloadGroup;
  byExtension: PayloadGroup[];
  gzipEligibleFiles: PayloadGroup;
  htmlFiles: PayloadGroup;
  topHtmlByBrotli: PayloadFile[];
  topHtmlByGzip: PayloadFile[];
  topHtmlByRaw: PayloadFile[];
}

/** Options for collecting payload data. */
export interface PayloadReportOptions {
  distDir: string;
  topCount?: number;
}

const defaultTopCount = 10;

const gzipEligibleExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
]);

/**
 * Collects raw and gzip payload sizes from generated static output.
 *
 * @param options Payload report options.
 * @param options.distDir Built output directory.
 * @param options.topCount Number of largest HTML files to include.
 * @returns Aggregated payload report.
 */
export function collectPayloadReport({
  distDir,
  topCount = defaultTopCount,
}: PayloadReportOptions): PayloadReport {
  if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
    throw new Error(`Build output directory not found: ${distDir}`);
  }

  const files = listFiles(distDir).map((absolutePath) =>
    measureFile(distDir, absolutePath),
  );
  const htmlFiles = files.filter((file) => file.extension === ".html");
  const gzipEligibleFiles = files.filter(
    (
      file,
    ): file is PayloadFile & {
      brotliBytes: number;
      gzipBytes: number;
    } => file.gzipBytes !== undefined && file.brotliBytes !== undefined,
  );

  return {
    allFiles: groupFiles("*", files),
    byExtension: groupByExtension(files),
    gzipEligibleFiles: groupFiles("gzip-eligible", gzipEligibleFiles),
    htmlFiles: groupFiles(".html", htmlFiles),
    topHtmlByBrotli: Array.from(htmlFiles)
      .sort(compareBrotliDescending)
      .slice(0, topCount),
    topHtmlByGzip: Array.from(htmlFiles)
      .sort(compareGzipDescending)
      .slice(0, topCount),
    topHtmlByRaw: Array.from(htmlFiles)
      .sort((left, right) => right.rawBytes - left.rawBytes)
      .slice(0, topCount),
  };
}

/**
 * Formats a generated-output payload report for human review.
 *
 * @param report Payload report.
 * @returns Human-readable payload report.
 */
export function formatPayloadReport(report: PayloadReport): string {
  const lines = [
    "Payload report:",
    `All assets: ${formatGroup(report.allFiles)}`,
    `Gzip-eligible assets: ${formatGroup(report.gzipEligibleFiles)}`,
    `HTML assets: ${formatGroup(report.htmlFiles)}`,
    "",
    "By extension:",
    ...report.byExtension.map(
      (group) => `- ${group.extension}: ${formatGroup(group)}`,
    ),
    "",
    "Largest HTML by Brotli:",
    ...formatFileList(report.topHtmlByBrotli),
    "",
    "Largest HTML by gzip:",
    ...formatFileList(report.topHtmlByGzip),
    "",
    "Largest HTML by raw size:",
    ...formatFileList(report.topHtmlByRaw),
  ];

  return lines.join("\n");
}

/**
 * Runs the payload reporting command-line workflow.
 *
 * @param args Command-line arguments without the executable prefix.
 * @param cwd Working directory for relative paths.
 * @returns Process exit code.
 */
export function runPayloadReportCli(
  args = process.argv.slice(2),
  cwd = process.cwd(),
): number {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: bun run payload:report [--dist <path>] [--json] [--top <count>]

Report raw, gzip, and Brotli sizes for generated static build output. Run bun
run build first unless a custom --dist directory is supplied.`);
    return 0;
  }

  const json = args.includes("--json");

  try {
    const report = collectPayloadReport({
      distDir: path.resolve(cwd, readValueArg(args, "--dist") ?? "dist"),
      topCount: readPositiveIntegerArg(args, "--top") ?? defaultTopCount,
    });

    console.log(
      json ? JSON.stringify(report, null, 2) : formatPayloadReport(report),
    );
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function brotliSize(contents: Buffer): number {
  return brotliCompressSync(contents, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
    },
  }).byteLength;
}

function compareBrotliDescending(
  left: PayloadFile,
  right: PayloadFile,
): number {
  return (right.brotliBytes ?? 0) - (left.brotliBytes ?? 0);
}

function compareGzipDescending(left: PayloadFile, right: PayloadFile): number {
  return (right.gzipBytes ?? 0) - (left.gzipBytes ?? 0);
}

function extensionForFile(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  return extension === "" ? "[none]" : extension;
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) {
    return "n/a";
  }

  return `${new Intl.NumberFormat("en-US").format(bytes)} B`;
}

function formatFileList(files: PayloadFile[]): string[] {
  if (files.length === 0) {
    return ["- none"];
  }

  return files.map(
    (file) =>
      `- ${file.path}: ${formatBytes(file.rawBytes)} raw, ${formatBytes(file.gzipBytes)} gzip, ${formatBytes(file.brotliBytes)} Brotli`,
  );
}

function formatGroup(group: PayloadGroup): string {
  return `${group.files} files, ${formatBytes(group.rawBytes)} raw, ${formatBytes(group.gzipBytes)} gzip, ${formatBytes(group.brotliBytes)} Brotli`;
}

function groupByExtension(files: PayloadFile[]): PayloadGroup[] {
  const extensions = Array.from(
    new Set(files.map((file) => file.extension)),
  ).sort((left, right) => left.localeCompare(right));

  return extensions.map((extension) =>
    groupFiles(
      extension,
      files.filter((file) => file.extension === extension),
    ),
  );
}

function groupFiles(extension: string, files: PayloadFile[]): PayloadGroup {
  const gzipValues = files.flatMap((file) =>
    file.gzipBytes === undefined ? [] : [file.gzipBytes],
  );
  const brotliValues = files.flatMap((file) =>
    file.brotliBytes === undefined ? [] : [file.brotliBytes],
  );

  return {
    brotliBytes:
      brotliValues.length === 0
        ? undefined
        : brotliValues.reduce((total, bytes) => total + bytes, 0),
    extension,
    files: files.length,
    gzipBytes:
      gzipValues.length === 0
        ? undefined
        : gzipValues.reduce((total, bytes) => total + bytes, 0),
    rawBytes: files.reduce((total, file) => total + file.rawBytes, 0),
  };
}

function listFiles(rootDir: string): string[] {
  return readdirSync(rootDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(absolutePath);
    }

    if (entry.isFile()) {
      return [absolutePath];
    }

    return [];
  });
}

function measureFile(rootDir: string, absolutePath: string): PayloadFile {
  const contents = readFileSync(absolutePath);
  const relativePath = path
    .relative(rootDir, absolutePath)
    .split(path.sep)
    .join("/");
  const extension = extensionForFile(relativePath);
  const isCompressionEligible = gzipEligibleExtensions.has(extension);

  return {
    brotliBytes: isCompressionEligible ? brotliSize(contents) : undefined,
    extension,
    gzipBytes: isCompressionEligible
      ? gzipSync(contents, { level: 9 }).byteLength
      : undefined,
    path: relativePath,
    rawBytes: contents.byteLength,
  };
}

function readPositiveIntegerArg(
  args: string[],
  flag: string,
): number | undefined {
  const rawValue = readValueArg(args, flag);

  if (rawValue === undefined) {
    return undefined;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }

  return value;
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

// Coverage note: this wrapper only connects the exported CLI workflow to
// process exit state; tests call `runPayloadReportCli()` directly.
if (import.meta.main) {
  try {
    process.exitCode = runPayloadReportCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
