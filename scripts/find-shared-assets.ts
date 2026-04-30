import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const sourceFilePattern = /\.(?:astro|css|mdx?|[cm]?[jt]sx?)$/i;
const assetExtensionPattern =
  /\.(?:avif|bmp|gif|ico|jpe?g|mp3|mp4|ogg|otf|pdf|png|svg|tiff?|ttf|wav|webm|webp|woff2?)$/i;

export interface AssetReference {
  assetPath: string;
  file: string;
  line: number;
  value: string;
}

export interface SharedAssetViolation {
  assetPath: string;
  references: AssetReference[];
  sourceFiles: string[];
}

export interface SharedAssetResult {
  referenceCount: number;
  referencedAssetCount: number;
  violations: SharedAssetViolation[];
}

export interface SharedAssetOptions {
  assetsDir?: string;
  rootDir: string;
  sharedAssetsDir?: string;
  srcDir?: string;
}

export interface AssetReferenceOptions {
  assetsDir?: string;
  rootDir: string;
  srcDir?: string;
}

function toPosix(file: string) {
  return file.split(path.sep).join("/");
}

function relative(rootDir: string, file: string) {
  return toPosix(path.relative(rootDir, file));
}

function isInside(file: string, dir: string) {
  const relativePath = path.relative(dir, file);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

async function listSourceFiles(dir: string, assetsDir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isInside(fullPath, assetsDir)) {
        continue;
      }

      files.push(...(await listSourceFiles(fullPath, assetsDir)));
    } else if (sourceFilePattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function safeDecodeUri(value: string) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function lineNumberAt(text: string, index: number) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function normalizeReference(value: string) {
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

export function resolveAssetReference(
  file: string,
  value: string,
  rootDir: string,
  assetsDir: string,
) {
  const normalized = normalizeReference(value);

  if (normalized === undefined) {
    return undefined;
  }

  let resolved: string;
  const absoluteAssetsPrefix = `/${relative(rootDir, assetsDir)}/`;
  const relativeAssetsPrefix = `${relative(rootDir, assetsDir)}/`;

  if (normalized.startsWith(absoluteAssetsPrefix)) {
    resolved = path.resolve(rootDir, `.${normalized}`);
  } else if (normalized.startsWith(relativeAssetsPrefix)) {
    resolved = path.resolve(rootDir, normalized);
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

function findClosingMarkdownTarget(text: string, start: number) {
  if (text[start] === "<") {
    const close = text.indexOf(">)", start);
    return close === -1 ? undefined : close + 1;
  }

  const close = text.indexOf(")", start);
  return close === -1 ? undefined : close;
}

function markdownTargetReferences(
  text: string,
  file: string,
  rootDir: string,
  assetsDir: string,
) {
  const references: AssetReference[] = [];
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
    const assetPath = resolveAssetReference(
      file,
      targetToken,
      rootDir,
      assetsDir,
    );

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

function quotedReferences(
  text: string,
  file: string,
  rootDir: string,
  assetsDir: string,
) {
  const references: AssetReference[] = [];
  const quotedPathPattern =
    /(["'`])((?:(?:\.\.?\/)+assets|\/?src\/assets)\/[^"'`\r\n]+)\1/g;

  for (const match of text.matchAll(quotedPathPattern)) {
    const value = match[2];

    if (value === undefined) {
      continue;
    }

    const assetPath = resolveAssetReference(file, value, rootDir, assetsDir);

    if (assetPath !== undefined) {
      references.push({
        assetPath,
        file,
        line: lineNumberAt(text, match.index),
        value,
      });
    }
  }

  return references;
}

function angleReferences(
  text: string,
  file: string,
  rootDir: string,
  assetsDir: string,
) {
  const references: AssetReference[] = [];
  const anglePathPattern =
    /<((?:(?:\.\.?\/)+assets|\/?src\/assets)\/[^>\r\n]+)>/g;

  for (const match of text.matchAll(anglePathPattern)) {
    const value = match[1];

    if (value === undefined) {
      continue;
    }

    const assetPath = resolveAssetReference(file, value, rootDir, assetsDir);

    if (assetPath !== undefined) {
      references.push({
        assetPath,
        file,
        line: lineNumberAt(text, match.index),
        value,
      });
    }
  }

  return references;
}

async function sourceFileReferences(
  file: string,
  rootDir: string,
  assetsDir: string,
) {
  const text = await readFile(file, "utf8");
  const references = [
    ...markdownTargetReferences(text, file, rootDir, assetsDir),
    ...quotedReferences(text, file, rootDir, assetsDir),
    ...angleReferences(text, file, rootDir, assetsDir),
  ];
  const seen = new Set<string>();

  return references.filter((reference) => {
    const key = `${reference.assetPath}:${reference.file}:${reference.line}:${reference.value}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function groupByAsset(references: AssetReference[]) {
  const groups = new Map<string, AssetReference[]>();

  for (const reference of references) {
    const group = groups.get(reference.assetPath) ?? [];
    group.push(reference);
    groups.set(reference.assetPath, group);
  }

  return groups;
}

function referencedFiles(references: AssetReference[]) {
  return new Set(references.map((reference) => reference.file));
}

export function sharedAssetViolations(
  groups: Map<string, AssetReference[]>,
  sharedAssetsDir: string,
) {
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
    .sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

export async function findAssetReferences({
  assetsDir,
  rootDir,
  srcDir,
}: AssetReferenceOptions) {
  const resolvedSrcDir = srcDir ?? path.resolve(rootDir, "src");
  const resolvedAssetsDir = assetsDir ?? path.resolve(rootDir, "src/assets");
  const sourceFiles = await listSourceFiles(resolvedSrcDir, resolvedAssetsDir);
  const references: AssetReference[] = [];

  for (const file of sourceFiles.sort()) {
    references.push(
      ...(await sourceFileReferences(file, rootDir, resolvedAssetsDir)),
    );
  }

  return references;
}

export async function findSharedAssets({
  assetsDir,
  rootDir,
  sharedAssetsDir,
  srcDir,
}: SharedAssetOptions): Promise<SharedAssetResult> {
  const resolvedSharedAssetsDir =
    sharedAssetsDir ?? path.resolve(rootDir, "src/assets/shared");
  const referenceOptions: AssetReferenceOptions = { rootDir };
  if (assetsDir !== undefined) {
    referenceOptions.assetsDir = assetsDir;
  }
  if (srcDir !== undefined) {
    referenceOptions.srcDir = srcDir;
  }

  const references = await findAssetReferences(referenceOptions);
  const groups = groupByAsset(references);

  return {
    referenceCount: references.length,
    referencedAssetCount: groups.size,
    violations: sharedAssetViolations(groups, resolvedSharedAssetsDir),
  };
}

export function formatSharedAssetReport(
  result: SharedAssetResult,
  rootDir: string,
) {
  if (result.violations.length === 0) {
    return `No shared src assets found outside src/assets/shared (${result.referencedAssetCount} referenced assets, ${result.referenceCount} references scanned).`;
  }

  const lines = [
    `Found ${result.violations.length} shared src asset${
      result.violations.length === 1 ? "" : "s"
    } outside src/assets/shared/:`,
    "",
    "Move shared files into src/assets/shared/, or duplicate intentionally only when the files are no longer meant to stay identical.",
  ];

  for (const violation of result.violations) {
    lines.push("", `- ${relative(rootDir, violation.assetPath)}`);

    for (const sourceFile of violation.sourceFiles) {
      const linesForFile = violation.references
        .filter((reference) => reference.file === sourceFile)
        .map((reference) => reference.line)
        .sort((left, right) => left - right);
      lines.push(
        `  - ${relative(rootDir, sourceFile)}:${[...new Set(linesForFile)].join(",")}`,
      );
    }
  }

  return lines.join("\n");
}

export async function runSharedAssetsCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: bun run assets:shared [--json]

Detect src assets referenced by more than one source file while living outside
src/assets/shared/.

The script scans source files under src/, excluding src/assets/. Multiple
references from the same source file do not make an asset shared.`);
    return 0;
  }

  const result = await findSharedAssets({ rootDir });

  if (args.includes("--json")) {
    console.log(
      JSON.stringify(
        {
          referenceCount: result.referenceCount,
          referencedAssetCount: result.referencedAssetCount,
          violations: result.violations.map((violation) => ({
            assetPath: relative(rootDir, violation.assetPath),
            references: violation.references.map((reference) => ({
              file: relative(rootDir, reference.file),
              line: reference.line,
              value: reference.value,
            })),
            sourceFiles: violation.sourceFiles.map((file) =>
              relative(rootDir, file),
            ),
          })),
        },
        null,
        2,
      ),
    );
  } else {
    const report = formatSharedAssetReport(result, rootDir);
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
    process.exitCode = await runSharedAssetsCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
