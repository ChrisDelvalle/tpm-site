import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

/** Inputs needed to verify source content conventions. */
export interface ContentVerificationOptions {
  articleDir: string;
  authorDir: string;
  categoryDir: string;
  rootDir: string;
}

/** Content verification output used by reports and tests. */
export interface ContentVerificationResult {
  draftCount: number;
  issues: string[];
  publishedCount: number;
}

/**
 * Runs the content verification command-line workflow.
 *
 * @param args Command-line arguments without the executable prefix.
 * @param rootDir Repository root to verify from.
 * @returns Process exit code.
 */
export async function runContentVerificationCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
): Promise<number> {
  const quiet = args.includes("--quiet");
  const result = await verifyContent({
    articleDir: path.resolve(rootDir, "src/content/articles"),
    authorDir: path.resolve(rootDir, "src/content/authors"),
    categoryDir: path.resolve(rootDir, "src/content/categories"),
    rootDir,
  });
  const report = formatContentVerificationResult(result);

  if (result.issues.length > 0) {
    console.error(report);
    return 1;
  }

  if (!quiet) {
    console.log(report);
  }

  return 0;
}

/**
 * Verifies source content paths and publication metadata invariants.
 *
 * @param options Article, category, and repository-root directories.
 * @param options.articleDir Source article directory.
 * @param options.authorDir Source author metadata directory.
 * @param options.categoryDir Source category metadata directory.
 * @param options.rootDir Repository root for relative error paths.
 * @returns Content verification result with counts and issues.
 */
export async function verifyContent({
  articleDir,
  authorDir,
  categoryDir,
  rootDir,
}: ContentVerificationOptions): Promise<ContentVerificationResult> {
  const articleFiles = await listFiles(articleDir, /\.mdx?$/i);
  const authorFiles = await listFiles(authorDir, /\.md$/i);
  const categoryFiles = await listFiles(categoryDir, /\.json$/i);
  const issues: string[] = [];
  const seenSlugs = new Map<string, string>();
  const authorAliases = await loadAuthorAliases(rootDir, authorFiles, issues);
  let draftCount = 0;

  for (const file of authorFiles) {
    validateAuthorMetadataFilename(rootDir, file, issues);
  }

  for (const file of categoryFiles) {
    validateCategoryMetadataFilename(rootDir, file, issues);
  }

  for (const file of articleFiles) {
    validateArticlePath(articleDir, file, seenSlugs, issues);

    const data = frontmatterData(await readFile(file, "utf8"));
    if (isDraft(data)) {
      draftCount += 1;
    }
    validateArticleAuthor(rootDir, file, data, authorAliases, issues);
  }

  return {
    draftCount,
    issues,
    publishedCount: articleFiles.length - draftCount,
  };
}

function categorySlug(articleDir: string, file: string) {
  return relativeArticlePath(articleDir, file).split("/")[0] ?? "";
}

function filenameStem(file: string) {
  return path.basename(file).replace(/\.(?:md|mdx)$/i, "");
}

function formatContentVerificationResult(result: ContentVerificationResult) {
  if (result.issues.length > 0) {
    return [
      "Content verification failed.",
      ...result.issues.map((issue) => `- ${issue}`),
    ].join("\n");
  }

  return `Content verification passed: ${result.publishedCount} published articles, ${result.draftCount} drafts.`;
}

function isDraft(data: Record<string, unknown>) {
  return data["draft"] === true;
}

function frontmatterData(text: string): Record<string, unknown> {
  const rawData: unknown = matter(text).data;

  return isRecord(rawData) ? rawData : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function loadAuthorAliases(
  rootDir: string,
  authorFiles: readonly string[],
  issues: string[],
): Promise<Set<string>> {
  const aliases = new Set<string>();

  for (const file of authorFiles) {
    const data = frontmatterData(await readFile(file, "utf8"));
    const displayName = data["displayName"];
    const authorAliases = data["aliases"];

    if (typeof displayName === "string") {
      addAuthorAlias(aliases, displayName);
    } else {
      issues.push(
        `${toPosix(path.relative(rootDir, file))}: author metadata needs a displayName`,
      );
    }

    if (Array.isArray(authorAliases)) {
      authorAliases
        .filter((alias): alias is string => typeof alias === "string")
        .forEach((alias) => addAuthorAlias(aliases, alias));
    }
  }

  return aliases;
}

function addAuthorAlias(aliases: Set<string>, value: string): void {
  aliases.add(normalizeAuthorAlias(value));
}

function isLowercaseAsciiLetterOrDigit(character: string): boolean {
  const codePoint = character.codePointAt(0);

  return (
    codePoint !== undefined &&
    ((codePoint >= 97 && codePoint <= 122) ||
      (codePoint >= 48 && codePoint <= 57))
  );
}

function isUrlSafeSlug(value: string): boolean {
  return (
    value !== "" &&
    value
      .split("-")
      .every(
        (segment) =>
          segment !== "" &&
          Array.from(segment).every(isLowercaseAsciiLetterOrDigit),
      )
  );
}

async function listFiles(dir: string, pattern: RegExp) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, pattern)));
    } else if (pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativeArticlePath(articleDir: string, file: string) {
  return toPosix(path.relative(articleDir, file));
}

function toPosix(file: string) {
  return file.split(path.sep).join("/");
}

function validateArticlePath(
  articleDir: string,
  file: string,
  seenSlugs: Map<string, string>,
  issues: string[],
) {
  const relativePath = relativeArticlePath(articleDir, file);
  const slug = filenameStem(file);
  const category = categorySlug(articleDir, file);

  if (!isUrlSafeSlug(slug)) {
    issues.push(`${relativePath}: filename stem is not URL-safe`);
  }

  if (!isUrlSafeSlug(category)) {
    issues.push(`${relativePath}: category folder is not URL-safe`);
  }

  const previous = seenSlugs.get(slug);
  if (previous !== undefined) {
    issues.push(
      `${relativePath}: duplicate article slug "${slug}" also used by ${previous}`,
    );
  } else {
    seenSlugs.set(slug, relativePath);
  }
}

function validateArticleAuthor(
  rootDir: string,
  file: string,
  data: Record<string, unknown>,
  authorAliases: Set<string>,
  issues: string[],
) {
  const author = data["author"];

  if (typeof author !== "string" || author.trim() === "") {
    issues.push(
      `${toPosix(path.relative(rootDir, file))}: article frontmatter needs an author string`,
    );
    return;
  }

  author
    .split(/\s*&\s*/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .forEach((part) => {
      if (!authorAliases.has(normalizeAuthorAlias(part))) {
        issues.push(
          `${toPosix(path.relative(rootDir, file))}: author "${part}" does not match src/content/authors/ aliases; add an author profile or approved alias`,
        );
      }
    });
}

function validateAuthorMetadataFilename(
  rootDir: string,
  file: string,
  issues: string[],
) {
  const slug = path.basename(file, ".md");

  if (!isUrlSafeSlug(slug)) {
    issues.push(
      `${toPosix(path.relative(rootDir, file))}: author metadata filename is not URL-safe`,
    );
  }
}

function validateCategoryMetadataFilename(
  rootDir: string,
  file: string,
  issues: string[],
) {
  const slug = path.basename(file, ".json");

  if (!isUrlSafeSlug(slug)) {
    issues.push(
      `${toPosix(path.relative(rootDir, file))}: category metadata filename is not URL-safe`,
    );
  }
}

function normalizeAuthorAlias(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

// Coverage note: this wrapper only wires the exported CLI workflow to process
// exit state; tests exercise `runContentVerificationCli()` directly.
if (import.meta.main) {
  try {
    process.exitCode = await runContentVerificationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
