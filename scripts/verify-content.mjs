import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const articleDir = path.resolve("src/content/articles");
const categoryDir = path.resolve("src/content/categories");
const urlSafeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requiredFields = ["title", "description", "date", "author"];
const bannedFields = [
  "banner",
  "category",
  "categories",
  "excerpt",
  "facebook",
  "fbpreview",
  "grand_parent",
  "has_children",
  "layout",
  "meta",
  "nav_order",
  "parent",
  "permalink",
  "published",
  "slug",
  "status",
  "topic",
  "type",
];

async function listFiles(dir, pattern) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

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

function relativeArticlePath(file) {
  return path.relative(articleDir, file);
}

function filenameStem(file) {
  return path.basename(file).replace(/\.(?:md|mdx)$/i, "");
}

function categorySlug(file) {
  return relativeArticlePath(file).split(path.sep)[0] ?? "";
}

function isValidDate(value) {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value === "string" || typeof value === "number") {
    return !Number.isNaN(new Date(value).getTime());
  }

  return false;
}

async function pathExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function sourceAssetExists(file, reference) {
  if (typeof reference !== "string") {
    return true;
  }

  if (reference.startsWith("http://") || reference.startsWith("https://")) {
    return true;
  }

  if (reference.startsWith("/")) {
    return false;
  }

  return pathExists(path.resolve(path.dirname(file), reference));
}

const articleFiles = await listFiles(articleDir, /\.mdx?$/i);
const categoryFiles = await listFiles(categoryDir, /\.json$/i);
const issues = [];
const seenSlugs = new Map();
let draftCount = 0;

for (const file of categoryFiles) {
  const slug = path.basename(file, ".json");
  if (!urlSafeSlugPattern.test(slug)) {
    issues.push(
      `src/content/categories/${path.basename(file)}: category metadata filename is not URL-safe`,
    );
  }
}

for (const file of articleFiles) {
  const relativePath = relativeArticlePath(file);
  const slug = filenameStem(file);
  const category = categorySlug(file);
  const { data } = matter(await readFile(file, "utf8"));

  if (!urlSafeSlugPattern.test(slug)) {
    issues.push(`${relativePath}: filename stem is not URL-safe`);
  }

  if (!urlSafeSlugPattern.test(category)) {
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

  for (const field of requiredFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      if (field === "date" && isValidDate(data[field])) {
        continue;
      }
      issues.push(`${relativePath}: missing required ${field} frontmatter`);
    }
  }

  if (!isValidDate(data.date)) {
    issues.push(`${relativePath}: date is not a valid date`);
  }

  if ("draft" in data && typeof data.draft !== "boolean") {
    issues.push(`${relativePath}: draft must be a boolean when present`);
  }

  if (data.draft === true) {
    draftCount += 1;
  }

  if (
    "tags" in data &&
    (!Array.isArray(data.tags) ||
      data.tags.some((tag) => typeof tag !== "string" || tag.trim() === ""))
  ) {
    issues.push(`${relativePath}: tags must be a string array when present`);
  }

  if ("imageAlt" in data && typeof data.imageAlt !== "string") {
    issues.push(`${relativePath}: imageAlt must be a string when present`);
  }

  if ("legacyPermalink" in data && typeof data.legacyPermalink !== "string") {
    issues.push(
      `${relativePath}: legacyPermalink must be a string when present`,
    );
  }

  if ("legacyBanner" in data && typeof data.legacyBanner !== "string") {
    issues.push(`${relativePath}: legacyBanner must be a string when present`);
  }

  if (!(await sourceAssetExists(file, data.image))) {
    issues.push(
      `${relativePath}: image must be a relative src/assets reference or remote URL`,
    );
  }

  for (const field of bannedFields) {
    if (field in data) {
      issues.push(`${relativePath}: remove unsupported ${field} frontmatter`);
    }
  }
}

if (issues.length > 0) {
  console.error("Content verification failed.");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `Content verification passed: ${articleFiles.length - draftCount} published articles, ${draftCount} drafts.`,
);
