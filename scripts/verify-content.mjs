import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const contentDir = path.resolve("src/content/legacy");
const publicDir = path.resolve("public");
const categorySources = new Set([
  "aesthetics",
  "game-studies",
  "history",
  "irony",
  "memeculture",
  "metamemetics",
  "philosophy",
  "politics",
]);
const imageFields = ["banner", "fbpreview", "image"];

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (/\.mdx?$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relativeContentPath(file) {
  return path.relative(contentDir, file);
}

function topLevelFolder(file) {
  return relativeContentPath(file).split(path.sep)[0] ?? "";
}

function isDatedPermalink(value) {
  return (
    typeof value === "string" &&
    /^\/?\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(value)
  );
}

function articleSlug(file, data) {
  if (isDatedPermalink(data.permalink)) {
    return data.permalink.match(/^\/?\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/)?.[1];
  }

  return relativeContentPath(file)
    .replace(/\.(md|mdx)$/i, "")
    .replace(/(^|\/)\d{4}[-_]\d{2}[-_]\d{2}[-_]/, "$1");
}

function isDraft(data) {
  return (
    data.published === false || data.status === "draft" || data.draft === true
  );
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

async function publicAssetExists(url) {
  if (typeof url !== "string" || !url.startsWith("/")) {
    return true;
  }

  const decoded = decodeURIComponent(url.split("#")[0].split("?")[0]).replace(
    /^\//,
    "",
  );

  try {
    await access(path.join(publicDir, decoded));
    return true;
  } catch {
    return false;
  }
}

const files = await listMarkdownFiles(contentDir);
const issues = [];
const seenSlugs = new Map();
let articleCount = 0;
let draftCount = 0;

for (const file of files) {
  const relativePath = relativeContentPath(file);
  const folder = topLevelFolder(file);

  if (!categorySources.has(folder)) {
    issues.push(
      `${relativePath}: unknown top-level content folder "${folder}"`,
    );
  }

  const { data } = matter(await readFile(file, "utf8"));
  const isArticle = isDatedPermalink(data.permalink);

  for (const field of imageFields) {
    if (!(await publicAssetExists(data[field]))) {
      issues.push(
        `${relativePath}: ${field} points to missing asset ${data[field]}`,
      );
    }
  }

  if (!isArticle) {
    continue;
  }

  articleCount += 1;
  if (isDraft(data)) {
    draftCount += 1;
  }

  if (typeof data.title !== "string" || data.title.trim() === "") {
    issues.push(`${relativePath}: article is missing a non-empty title`);
  }

  if (!isValidDate(data.date)) {
    issues.push(`${relativePath}: article is missing a valid date`);
  }

  if (!categorySources.has(folder)) {
    issues.push(
      `${relativePath}: article is not inside a known category folder`,
    );
  }

  const slug = articleSlug(file, data);
  const previous = slug ? seenSlugs.get(slug) : undefined;
  if (!slug) {
    issues.push(`${relativePath}: could not derive article slug`);
  } else if (previous) {
    issues.push(
      `${relativePath}: duplicate article slug "${slug}" also used by ${previous}`,
    );
  } else {
    seenSlugs.set(slug, relativePath);
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
  `Content verification passed: ${articleCount} articles, ${draftCount} draft/unpublished entries.`,
);
