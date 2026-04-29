import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const srcAssetsDir = "src/assets";
const ignoreFile = "scripts/image-asset-location-ignore.json";
const imageExtensionPattern =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$/i;
const alwaysIgnoredDirectoryNames = new Set([".git", "node_modules"]);
const help = process.argv.includes("--help") || process.argv.includes("-h");
const json = process.argv.includes("--json");

if (help) {
  console.log(`Usage: bun run assets:locations [--json]

Require image assets to live under src/assets/.

Intentional exceptions are configured in ${ignoreFile}. Dotfiles,
dot-directories, and paths ignored by Git are skipped automatically.
`);
  process.exit(0);
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function normalizeRelativePath(file) {
  return toPosix(path.relative(rootDir, file));
}

function regexEscape(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(pattern) {
  let source = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    const nextCharacter = pattern[index + 1];

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

async function loadIgnorePatterns() {
  const text = await readFile(path.resolve(ignoreFile), "utf8");
  const patterns = JSON.parse(text);

  if (
    !Array.isArray(patterns) ||
    patterns.some((pattern) => typeof pattern !== "string")
  ) {
    throw new TypeError(`${ignoreFile} must contain a JSON array of strings.`);
  }

  return patterns.map((pattern) => ({
    pattern,
    regex: globToRegExp(pattern),
  }));
}

function isIgnored(relativePath, ignorePatterns) {
  return ignorePatterns.some(({ regex }) => regex.test(relativePath));
}

function hasDotPathSegment(relativePath) {
  return relativePath
    .split("/")
    .some((segment) => segment.startsWith(".") && segment !== ".");
}

function isGitIgnored(relativePath) {
  const result = spawnSync(
    "git",
    ["check-ignore", "--quiet", "--no-index", "--", relativePath],
    {
      cwd: rootDir,
    },
  );

  return result.status === 0;
}

function shouldSkip(relativePath, ignorePatterns) {
  return (
    hasDotPathSegment(relativePath) ||
    isGitIgnored(relativePath) ||
    isIgnored(relativePath, ignorePatterns)
  );
}

function isAllowedAssetLocation(relativePath) {
  return (
    relativePath === srcAssetsDir || relativePath.startsWith(`${srcAssetsDir}/`)
  );
}

async function listImageFiles(dir, ignorePatterns) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = normalizeRelativePath(fullPath);

    if (entry.isDirectory()) {
      if (
        alwaysIgnoredDirectoryNames.has(entry.name) ||
        shouldSkip(`${relativePath}/`, ignorePatterns)
      ) {
        continue;
      }

      files.push(...(await listImageFiles(fullPath, ignorePatterns)));
    } else if (
      imageExtensionPattern.test(entry.name) &&
      !shouldSkip(relativePath, ignorePatterns)
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

function printTextReport(violations, imageCount) {
  if (violations.length === 0) {
    console.log(
      `Image asset location verification passed: ${imageCount} image files scanned.`,
    );
    return;
  }

  console.error(
    `Image asset location verification failed: ${violations.length} image file${
      violations.length === 1 ? "" : "s"
    } found outside src/assets/.`,
  );
  console.error("");
  console.error("Move each file into the appropriate source asset folder:");
  console.error("- src/assets/articles/<article-slug>/ for one article.");
  console.error("- src/assets/shared/ for assets reused by multiple pages.");
  console.error("- src/assets/site/ for site UI, layout, and homepage assets.");
  console.error("");
  console.error(
    `If a file intentionally must stay outside src/assets/, add a specific path or glob to ${ignoreFile}.`,
  );
  console.error("");
  console.error("Files:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
}

const ignorePatterns = await loadIgnorePatterns();
const imageFiles = await listImageFiles(rootDir, ignorePatterns);
const violations = imageFiles
  .filter((file) => !isAllowedAssetLocation(file))
  .filter((file) => !isIgnored(file, ignorePatterns))
  .sort((left, right) => left.localeCompare(right));

if (json) {
  console.log(
    JSON.stringify(
      {
        ignoreFile,
        ignoredPatterns: ignorePatterns.map(({ pattern }) => pattern),
        imageCount: imageFiles.length,
        violations,
      },
      null,
      2,
    ),
  );
} else {
  printTextReport(violations, imageFiles.length);
}

if (violations.length > 0) {
  process.exit(1);
}
