import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.resolve("src");
const assetsDir = path.resolve("src/assets");
const sharedAssetsDir = path.resolve("src/assets/shared");
const sourceFilePattern = /\.(?:astro|css|mdx?|[cm]?[jt]sx?)$/i;
const assetExtensionPattern =
  /\.(?:avif|bmp|gif|ico|jpe?g|mp3|mp4|ogg|otf|pdf|png|svg|tiff?|ttf|wav|webm|webp|woff2?)$/i;
const help = process.argv.includes("--help") || process.argv.includes("-h");
const json = process.argv.includes("--json");

if (help) {
  console.log(`Usage: bun run assets:shared [--json]

Detect src assets referenced by more than one source file while living outside
src/assets/shared/.

The script scans source files under src/, excluding src/assets/. Multiple
references from the same source file do not make an asset shared.
`);
  process.exit(0);
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function relative(file) {
  return toPosix(path.relative(rootDir, file));
}

function isInside(file, dir) {
  const relativePath = path.relative(dir, file);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isInside(fullPath, assetsDir)) {
        continue;
      }

      files.push(...(await listSourceFiles(fullPath)));
    } else if (sourceFilePattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function safeDecodeUri(value) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function normalizeReference(value) {
  let raw = value.trim();

  if (raw.startsWith("<") && raw.endsWith(">")) {
    raw = raw.slice(1, -1).trim();
  }

  if (
    raw === "" ||
    raw.includes("${") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//")
  ) {
    return undefined;
  }

  const pathOnly = safeDecodeUri(raw.split(/[?#]/, 1)[0] ?? raw);

  if (!assetExtensionPattern.test(pathOnly)) {
    return undefined;
  }

  return pathOnly;
}

function resolveAssetReference(file, value) {
  const normalized = normalizeReference(value);

  if (normalized === undefined) {
    return undefined;
  }

  let resolved;

  if (normalized.startsWith("/src/assets/")) {
    resolved = path.resolve(`.${normalized}`);
  } else if (normalized.startsWith("src/assets/")) {
    resolved = path.resolve(normalized);
  } else if (/^(?:\.\.?\/)+assets\//.test(normalized)) {
    resolved = path.resolve(path.dirname(file), normalized);
  } else {
    return undefined;
  }

  if (!isInside(resolved, assetsDir)) {
    return undefined;
  }

  return resolved;
}

function findClosingMarkdownTarget(text, start) {
  if (text[start] === "<") {
    const close = text.indexOf(">)", start);
    return close === -1 ? undefined : close + 1;
  }

  const close = text.indexOf(")", start);
  return close === -1 ? undefined : close;
}

function markdownTargetReferences(text, file) {
  const references = [];
  let searchIndex = 0;

  while (searchIndex < text.length) {
    const targetOpen = text.indexOf("](", searchIndex);

    if (targetOpen === -1) {
      break;
    }

    const targetStart = targetOpen + 2;
    const targetEnd = findClosingMarkdownTarget(text, targetStart);

    if (targetEnd === undefined) {
      searchIndex = targetStart;
      continue;
    }

    const targetToken = text.slice(targetStart, targetEnd);
    const assetPath = resolveAssetReference(file, targetToken);

    if (assetPath !== undefined) {
      references.push({
        assetPath,
        file,
        line: lineNumberAt(text, targetStart),
        value: targetToken,
      });
    }

    searchIndex = targetEnd + 1;
  }

  return references;
}

function quotedReferences(text, file) {
  const references = [];
  const quotedPathPattern =
    /(["'`])((?:(?:\.\.?\/)+assets|\/?src\/assets)\/[^"'`\r\n]+)\1/g;

  for (const match of text.matchAll(quotedPathPattern)) {
    const value = match[2];
    const assetPath = resolveAssetReference(file, value);

    if (assetPath !== undefined) {
      references.push({
        assetPath,
        file,
        line: lineNumberAt(text, match.index ?? 0),
        value,
      });
    }
  }

  return references;
}

function angleReferences(text, file) {
  const references = [];
  const anglePathPattern =
    /<((?:(?:\.\.?\/)+assets|\/?src\/assets)\/[^>\r\n]+)>/g;

  for (const match of text.matchAll(anglePathPattern)) {
    const value = match[1];
    const assetPath = resolveAssetReference(file, value);

    if (assetPath !== undefined) {
      references.push({
        assetPath,
        file,
        line: lineNumberAt(text, match.index ?? 0),
        value,
      });
    }
  }

  return references;
}

async function sourceFileReferences(file) {
  const text = await readFile(file, "utf8");
  const references = [
    ...markdownTargetReferences(text, file),
    ...quotedReferences(text, file),
    ...angleReferences(text, file),
  ];
  const seen = new Set();

  return references.filter((reference) => {
    const key = `${reference.assetPath}:${reference.file}:${reference.line}:${reference.value}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function groupByAsset(references) {
  const groups = new Map();

  for (const reference of references) {
    const group = groups.get(reference.assetPath) ?? [];
    group.push(reference);
    groups.set(reference.assetPath, group);
  }

  return groups;
}

function referencedFiles(references) {
  return new Set(references.map((reference) => reference.file));
}

function sharedAssetViolations(groups) {
  return [...groups.entries()]
    .map(([assetPath, references]) => ({
      assetPath,
      references,
      sourceFiles: [...referencedFiles(references)].sort(),
    }))
    .filter(
      (group) =>
        group.sourceFiles.length > 1 &&
        !isInside(group.assetPath, sharedAssetsDir),
    )
    .sort((left, right) =>
      relative(left.assetPath).localeCompare(relative(right.assetPath)),
    );
}

function printTextReport(violations, referenceCount, assetCount) {
  if (violations.length === 0) {
    console.log(
      `No shared src assets found outside src/assets/shared (${assetCount} referenced assets, ${referenceCount} references scanned).`,
    );
    return;
  }

  console.error(
    `Found ${violations.length} shared src asset${violations.length === 1 ? "" : "s"} outside src/assets/shared/:`,
  );

  for (const violation of violations) {
    console.error(`\n- ${relative(violation.assetPath)}`);
    for (const sourceFile of violation.sourceFiles) {
      const lines = violation.references
        .filter((reference) => reference.file === sourceFile)
        .map((reference) => reference.line)
        .sort((left, right) => left - right);
      console.error(
        `  - ${relative(sourceFile)}:${[...new Set(lines)].join(",")}`,
      );
    }
  }
}

const sourceFiles = await listSourceFiles(srcDir);
const references = [];

for (const file of sourceFiles.sort()) {
  references.push(...(await sourceFileReferences(file)));
}

const groups = groupByAsset(references);
const violations = sharedAssetViolations(groups);

if (json) {
  console.log(
    JSON.stringify(
      {
        referenceCount: references.length,
        referencedAssetCount: groups.size,
        violations: violations.map((violation) => ({
          assetPath: relative(violation.assetPath),
          references: violation.references.map((reference) => ({
            file: relative(reference.file),
            line: reference.line,
            value: reference.value,
          })),
          sourceFiles: violation.sourceFiles.map(relative),
        })),
      },
      null,
      2,
    ),
  );
} else {
  printTextReport(violations, references.length, groups.size);
}

if (violations.length > 0) {
  process.exit(1);
}
