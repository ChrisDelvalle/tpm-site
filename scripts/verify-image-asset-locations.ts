import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const defaultSrcAssetsDir = "src/assets";
const defaultIgnoreFile = "scripts/image-asset-location-ignore.json";
const imageExtensionPattern =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$/i;
const alwaysIgnoredDirectoryNames = new Set([".git", "node_modules"]);

export interface IgnorePattern {
  pattern: string;
  regex: RegExp;
}

export interface ImageAssetLocationOptions {
  ignoreFile?: string;
  isGitIgnored?: (relativePath: string) => boolean;
  rootDir: string;
  srcAssetsDir?: string;
}

export interface ImageAssetLocationResult {
  ignoredPatterns: string[];
  imageCount: number;
  violations: string[];
}

function toPosix(file: string) {
  return file.split(path.sep).join("/");
}

function normalizeRelativePath(rootDir: string, file: string) {
  return toPosix(path.relative(rootDir, file));
}

function regexEscape(value: string) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

export function globToRegExp(pattern: string) {
  let source = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern.charAt(index);
    const nextCharacter = pattern.charAt(index + 1);

    if (character === "*" && nextCharacter === "*") {
      source += ".*";
      index += 1;
    } else if (character === "*") {
      source += "[^/]*";
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += regexEscape(character);
    }
  }

  return new RegExp(`${source}$`);
}

async function loadIgnorePatterns(rootDir: string, ignoreFile: string) {
  const text = await readFile(path.resolve(rootDir, ignoreFile), "utf8");
  const patterns: unknown = JSON.parse(text);

  if (!isStringArray(patterns)) {
    throw new TypeError(`${ignoreFile} must contain a JSON array of strings.`);
  }

  return patterns.map((pattern) => ({
    pattern,
    regex: globToRegExp(pattern),
  }));
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((pattern) => typeof pattern === "string")
  );
}

function isIgnored(relativePath: string, ignorePatterns: IgnorePattern[]) {
  return ignorePatterns.some(({ regex }) => regex.test(relativePath));
}

function hasDotPathSegment(relativePath: string) {
  return relativePath
    .split("/")
    .some((segment) => segment.startsWith(".") && segment !== ".");
}

function defaultIsGitIgnored(rootDir: string, relativePath: string) {
  const result = spawnSync(
    "git",
    ["check-ignore", "--quiet", "--no-index", "--", relativePath],
    {
      cwd: rootDir,
    },
  );

  return result.status === 0;
}

function shouldSkip(
  relativePath: string,
  ignorePatterns: IgnorePattern[],
  isGitIgnored: (relativePath: string) => boolean,
) {
  return (
    hasDotPathSegment(relativePath) ||
    isGitIgnored(relativePath) ||
    isIgnored(relativePath, ignorePatterns)
  );
}

function isAllowedAssetLocation(relativePath: string, srcAssetsDir: string) {
  return (
    relativePath === srcAssetsDir || relativePath.startsWith(`${srcAssetsDir}/`)
  );
}

async function listImageFiles(
  dir: string,
  rootDir: string,
  ignorePatterns: IgnorePattern[],
  isGitIgnored: (relativePath: string) => boolean,
) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = normalizeRelativePath(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (
        alwaysIgnoredDirectoryNames.has(entry.name) ||
        shouldSkip(`${relativePath}/`, ignorePatterns, isGitIgnored)
      ) {
        continue;
      }

      files.push(
        ...(await listImageFiles(
          fullPath,
          rootDir,
          ignorePatterns,
          isGitIgnored,
        )),
      );
    } else if (
      imageExtensionPattern.test(entry.name) &&
      !shouldSkip(relativePath, ignorePatterns, isGitIgnored)
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

export async function verifyImageAssetLocations({
  ignoreFile = defaultIgnoreFile,
  isGitIgnored,
  rootDir,
  srcAssetsDir = defaultSrcAssetsDir,
}: ImageAssetLocationOptions): Promise<ImageAssetLocationResult> {
  const ignorePatterns = await loadIgnorePatterns(rootDir, ignoreFile);
  const gitIgnored =
    isGitIgnored ??
    ((relativePath: string) => defaultIsGitIgnored(rootDir, relativePath));
  const imageFiles = await listImageFiles(
    rootDir,
    rootDir,
    ignorePatterns,
    gitIgnored,
  );
  const violations = imageFiles
    .filter((file) => !isAllowedAssetLocation(file, srcAssetsDir))
    .filter((file) => !isIgnored(file, ignorePatterns))
    .sort((left, right) => left.localeCompare(right));

  return {
    ignoredPatterns: ignorePatterns.map(({ pattern }) => pattern),
    imageCount: imageFiles.length,
    violations,
  };
}

export function formatImageAssetLocationReport(
  result: ImageAssetLocationResult,
  ignoreFile = defaultIgnoreFile,
) {
  if (result.violations.length === 0) {
    return `Image asset location verification passed: ${result.imageCount} image files scanned.`;
  }

  return [
    `Image asset location verification failed: ${result.violations.length} image file${
      result.violations.length === 1 ? "" : "s"
    } found outside src/assets/.`,
    "",
    "Move each file into the appropriate source asset folder:",
    "- src/assets/articles/<article-slug>/ for one article.",
    "- src/assets/shared/ for assets reused by multiple pages.",
    "- src/assets/site/ for site UI, layout, and homepage assets.",
    "",
    `If a file intentionally must stay outside src/assets/, add a specific path or glob to ${ignoreFile}.`,
    "",
    "Files:",
    ...result.violations.map((violation) => `- ${violation}`),
  ].join("\n");
}

export async function runImageAssetLocationCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: bun run assets:locations [--json]

Require image assets to live under src/assets/.

Intentional exceptions are configured in ${defaultIgnoreFile}. Dotfiles,
dot-directories, and paths ignored by Git are skipped automatically.`);
    return 0;
  }

  const result = await verifyImageAssetLocations({ rootDir });

  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const report = formatImageAssetLocationReport(result);
    if (result.violations.length > 0) {
      console.error(report);
    } else {
      console.log(report);
    }
  }

  return result.violations.length > 0 ? 1 : 0;
}

if (import.meta.main) {
  try {
    process.exitCode = await runImageAssetLocationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
