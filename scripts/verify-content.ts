import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

/** Inputs needed to verify source content conventions. */
export interface ContentVerificationOptions {
  articleDir: string;
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
 * @param options.categoryDir Source category metadata directory.
 * @param options.rootDir Repository root for relative error paths.
 * @returns Content verification result with counts and issues.
 */
export async function verifyContent({
  articleDir,
  categoryDir,
  rootDir,
}: ContentVerificationOptions): Promise<ContentVerificationResult> {
  const articleFiles = await listFiles(articleDir, /\.mdx?$/i);
  const categoryFiles = await listFiles(categoryDir, /\.json$/i);
  const issues: string[] = [];
  const seenSlugs = new Map<string, string>();
  let draftCount = 0;

  for (const file of categoryFiles) {
    validateCategoryMetadataFilename(rootDir, file, issues);
  }

  for (const file of articleFiles) {
    validateArticlePath(articleDir, file, seenSlugs, issues);

    const { data } = matter(await readFile(file, "utf8"));
    if (isDraft(data)) {
      draftCount += 1;
    }
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

if (import.meta.main) {
  try {
    process.exitCode = await runContentVerificationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
