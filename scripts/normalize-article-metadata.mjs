import { spawnSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const args = new Set(process.argv.slice(2));
const allowDirty = args.has("--allow-dirty");
const write = args.has("--write");
const rootDir = process.cwd();
const articlesDir = path.resolve("src/content/articles");
const markdownExtensionPattern = /\.mdx?$/i;
const duplicateSocialImageFields = new Set(["fbpreview"]);
const droppedLegacyCategoryTags = new Set(["mike", "note", "seong"]);
const removableFields = new Set([
  "facebook",
  "grand_parent",
  "has_children",
  "layout",
  "meta",
  "nav_order",
  "parent",
  "published",
  "status",
  "type",
]);
const knownFields = new Set([
  "author",
  "banner",
  "categories",
  "date",
  "description",
  "draft",
  "excerpt",
  "fbpreview",
  "image",
  "imageAlt",
  "legacyBanner",
  "legacyCategories",
  "legacyPermalink",
  "permalink",
  "tags",
  "title",
  ...removableFields,
]);

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (markdownExtensionPattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(rootDir, file);
}

function frontmatterParts(text) {
  const match = text.match(
    /^(---[^\S\r\n]*\r?\n)([\s\S]*?)(\r?\n---[^\S\r\n]*(?:\r?\n)?)/,
  );

  if (!match) {
    return undefined;
  }

  return {
    body: match[2],
    full: match[0],
  };
}

function topLevelKey(line) {
  return line.match(/^([\w-]+):(.*)$/)?.[1];
}

function splitFieldBlocks(body) {
  const lines = body.split(/\r?\n/);
  const blocks = [];
  let current;

  for (const line of lines) {
    const key = topLevelKey(line);

    if (key !== undefined) {
      current = { key, lines: [line] };
      blocks.push(current);
    } else if (current !== undefined) {
      current.lines.push(line);
    }
  }

  return blocks;
}

function lastFieldBlockMap(blocks) {
  const map = new Map();

  for (const block of blocks) {
    map.set(block.key, block);
  }

  return map;
}

function fieldValueSuffix(block) {
  return block.lines[0]?.replace(/^[\w-]+:/, "") ?? "";
}

function renameFieldBlock(block, key) {
  return [`${key}:${fieldValueSuffix(block)}`, ...block.lines.slice(1)].join(
    "\n",
  );
}

function singleLineField(key, value) {
  return `${key}: ${JSON.stringify(value)}`;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringFromUnknown(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string" && item.trim() !== "")
      .join(", ");
  }

  return undefined;
}

function authorDisplayName(value) {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const displayName = stringFromUnknown(value.display_name);
  if (displayName !== undefined && displayName.trim() !== "") {
    return displayName;
  }

  const firstName = stringFromUnknown(value.first_name);
  const lastName = stringFromUnknown(value.last_name);
  const name = [firstName, lastName]
    .filter((part) => part !== undefined && part.trim() !== "")
    .join(" ");

  return name === "" ? undefined : name;
}

function normalizedMediaReference(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const withoutDomain = value
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?thephilosophersmeme\.com(?=\/)/i, "");

  return withoutDomain.startsWith("/") ? withoutDomain : `/${withoutDomain}`;
}

function shouldDropSocialImage(data, field) {
  if (!duplicateSocialImageFields.has(field)) {
    return false;
  }

  const socialImage = normalizedMediaReference(data[field]);
  const canonicalImage = normalizedMediaReference(data.image);

  return (
    socialImage !== undefined &&
    canonicalImage !== undefined &&
    socialImage === canonicalImage
  );
}

function createStats() {
  return {
    droppedDuplicateFbpreview: 0,
    droppedLegacyCategories: 0,
    mergedLegacyCategories: 0,
    migratedCategories: 0,
    migratedDescription: 0,
    migratedDraft: 0,
    migratedLegacyBanner: 0,
    migratedLegacyPermalink: 0,
    missingDescription: 0,
    normalizedAuthor: 0,
    removedFields: new Map(),
    unresolvedFields: [],
  };
}

function duplicateKeys(blocks) {
  return blocks
    .map((block) => block.key)
    .filter((key, index, keys) => keys.indexOf(key) !== index);
}

function normalizedMatterSource(fields, text, frontmatter) {
  return `---\n${[...fields.values()]
    .map((block) => block.lines.join("\n"))
    .join("\n")}\n---\n${text.slice(frontmatter.full.length)}`;
}

function addUnknownFieldIssues(fields, issues) {
  for (const block of fields.values()) {
    if (!knownFields.has(block.key)) {
      issues.push(`unknown frontmatter field "${block.key}"`);
    }
  }
}

function addRequiredBlock(output, fields, key, issues) {
  const block = fields.get(key);
  if (block) {
    output.push(block.lines.join("\n"));
  } else {
    issues.push(`missing ${key}`);
  }
}

function addDescription(output, fields, stats, issues) {
  const description = fields.get("description");
  const excerpt = fields.get("excerpt");
  if (description && excerpt) {
    issues.push("has both description and excerpt");
  }
  if (description) {
    output.push(description.lines.join("\n"));
    return;
  }
  if (excerpt) {
    output.push(renameFieldBlock(excerpt, "description"));
    stats.migratedDescription += 1;
    return;
  }

  stats.missingDescription += 1;
  stats.unresolvedFields.push("missing description");
}

function addAuthor(output, fields, data, stats, issues) {
  const author = authorDisplayName(data.author);
  if (author === undefined) {
    issues.push("missing normalized author");
    return;
  }

  output.push(singleLineField("author", author));
  if (fields.get("author")?.lines.length !== 1 || data.author !== author) {
    stats.normalizedAuthor += 1;
  }
}

function addOptionalBlocks(output, fields, keys) {
  for (const key of keys) {
    const block = fields.get(key);
    if (block) {
      output.push(block.lines.join("\n"));
    }
  }
}

function normalizedTagValue(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLowerCase()
    : undefined;
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim() !== "")
    : [];
}

function tagsBlock(tags) {
  return ["tags:", ...tags.map((tag) => `  - ${JSON.stringify(tag)}`)].join(
    "\n",
  );
}

function legacyCategoryTags(data) {
  return stringArray(data.legacyCategories ?? data.categories)
    .map((category) => normalizedTagValue(category))
    .filter(
      (category) =>
        category !== undefined && !droppedLegacyCategoryTags.has(category),
    );
}

function addTags(output, fields, data, stats) {
  const tags = stringArray(data.tags);
  const legacyCategories = stringArray(
    data.legacyCategories ?? data.categories,
  );
  const categoryTags = legacyCategoryTags(data);
  stats.droppedLegacyCategories +=
    legacyCategories.length - categoryTags.length;

  if (categoryTags.length === 0) {
    const block = fields.get("tags");
    if (block) {
      output.push(block.lines.join("\n"));
    }

    return;
  }

  const seen = new Set(tags.map((tag) => normalizedTagValue(tag)));
  const nextTags = [...tags];

  for (const category of categoryTags) {
    if (!seen.has(category)) {
      nextTags.push(category);
      seen.add(category);
      stats.mergedLegacyCategories += 1;
    }
  }

  if (nextTags.length > 0) {
    output.push(tagsBlock(nextTags));
  }
}

function addDraft(output, data, stats) {
  if (
    data.draft !== true &&
    data.published !== false &&
    data.status !== "draft"
  ) {
    return;
  }

  output.push("draft: true");
  if (data.draft !== true) {
    stats.migratedDraft += 1;
  }
}

function addLegacyPermalink(output, fields, stats, issues) {
  const legacyPermalink = fields.get("legacyPermalink");
  const permalink = fields.get("permalink");
  if (legacyPermalink && permalink) {
    issues.push("has both legacyPermalink and permalink");
  }
  if (legacyPermalink) {
    output.push(legacyPermalink.lines.join("\n"));
    return;
  }
  if (permalink) {
    output.push(renameFieldBlock(permalink, "legacyPermalink"));
    stats.migratedLegacyPermalink += 1;
    return;
  }

  issues.push("missing permalink/legacyPermalink");
}

function addLegacyCategories(output, fields, stats) {
  const categories = fields.get("categories");
  const legacyCategories = fields.get("legacyCategories");
  if (categories) {
    stats.migratedCategories += 1;
  }
  if (legacyCategories) {
    stats.removedFields.set(
      "legacyCategories",
      (stats.removedFields.get("legacyCategories") ?? 0) + 1,
    );
  }
}

function addLegacyBanner(output, fields, stats) {
  const legacyBanner = fields.get("legacyBanner");
  const banner = fields.get("banner");

  if (legacyBanner && banner) {
    stats.unresolvedFields.push("duplicate legacyBanner/banner");
  }
  if (legacyBanner) {
    output.push(legacyBanner.lines.join("\n"));
    return;
  }
  if (banner) {
    output.push(renameFieldBlock(banner, "legacyBanner"));
    stats.migratedLegacyBanner += 1;
  }
}

function removeSocialPreviewFields(fields, data, stats) {
  const fbpreview = fields.get("fbpreview");
  if (!fbpreview) {
    return;
  }

  if (shouldDropSocialImage(data, "fbpreview")) {
    stats.droppedDuplicateFbpreview += 1;
  } else {
    stats.removedFields.set(
      "fbpreview",
      (stats.removedFields.get("fbpreview") ?? 0) + 1,
    );
  }
}

function addRemovedFieldStats(fields, duplicates, stats) {
  for (const key of removableFields) {
    if (fields.has(key)) {
      stats.removedFields.set(key, (stats.removedFields.get(key) ?? 0) + 1);
    }
  }

  for (const key of duplicates) {
    stats.removedFields.set(
      `duplicate:${key}`,
      (stats.removedFields.get(`duplicate:${key}`) ?? 0) + 1,
    );
  }
}

function normalizeFrontmatter(text) {
  const parts = frontmatterParts(text);
  if (!parts) {
    return { changed: false, issues: ["missing frontmatter"], text };
  }

  const blocks = splitFieldBlocks(parts.body);
  const fields = lastFieldBlockMap(blocks);
  const { data } = matter(normalizedMatterSource(fields, text, parts));
  const output = [];
  const issues = [];
  const stats = createStats();

  addUnknownFieldIssues(fields, issues);
  addRequiredBlock(output, fields, "title", issues);
  addDescription(output, fields, stats, issues);
  addRequiredBlock(output, fields, "date", issues);
  addAuthor(output, fields, data, stats, issues);
  addOptionalBlocks(output, fields, ["image", "imageAlt"]);
  addTags(output, fields, data, stats);
  addDraft(output, data, stats);
  addLegacyPermalink(output, fields, stats, issues);
  addLegacyCategories(output, fields, stats);
  addLegacyBanner(output, fields, stats);
  removeSocialPreviewFields(fields, data, stats);
  addRemovedFieldStats(fields, duplicateKeys(blocks), stats);

  const nextText = `---\n${output.join("\n")}\n---\n${text.slice(parts.full.length)}`;
  return {
    changed: nextText !== text,
    issues,
    stats,
    text: nextText,
  };
}

function mergeStats(total, stats) {
  total.droppedDuplicateFbpreview += stats.droppedDuplicateFbpreview;
  total.droppedLegacyCategories += stats.droppedLegacyCategories;
  total.mergedLegacyCategories += stats.mergedLegacyCategories;
  total.migratedCategories += stats.migratedCategories;
  total.migratedDescription += stats.migratedDescription;
  total.migratedDraft += stats.migratedDraft;
  total.migratedLegacyBanner += stats.migratedLegacyBanner;
  total.migratedLegacyPermalink += stats.migratedLegacyPermalink;
  total.missingDescription += stats.missingDescription;
  total.normalizedAuthor += stats.normalizedAuthor;

  for (const [key, count] of stats.removedFields.entries()) {
    total.removedFields.set(key, (total.removedFields.get(key) ?? 0) + count);
  }
}

function gitStatus(paths) {
  const result = spawnSync("git", ["status", "--porcelain", "--", ...paths], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "git status failed");
  }

  return result.stdout.trim();
}

const files = await listMarkdownFiles(articlesDir);
const changes = [];
const issues = [];
const unresolvedByFile = [];
const totalStats = {
  droppedDuplicateFbpreview: 0,
  droppedLegacyCategories: 0,
  mergedLegacyCategories: 0,
  migratedCategories: 0,
  migratedDescription: 0,
  migratedDraft: 0,
  migratedLegacyBanner: 0,
  migratedLegacyPermalink: 0,
  missingDescription: 0,
  normalizedAuthor: 0,
  removedFields: new Map(),
};

for (const file of files) {
  const source = await readFile(file, "utf8");
  const result = normalizeFrontmatter(source);
  const relativePath = relative(file);

  if (result.issues.length > 0) {
    issues.push(...result.issues.map((issue) => `${relativePath}: ${issue}`));
  }

  if (result.stats.unresolvedFields.length > 0) {
    unresolvedByFile.push(
      `${relativePath}: ${[...new Set(result.stats.unresolvedFields)].join(", ")}`,
    );
  }

  mergeStats(totalStats, result.stats);

  if (result.changed) {
    changes.push({ file, text: result.text });
  }
}

if (issues.length > 0) {
  console.error("Article metadata normalization found issues.");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `${write ? "Applying" : "Planning"} article metadata normalization.`,
);
console.log(`${files.length} article files scanned.`);
console.log(
  `${changes.length} article files ${write ? "changed" : "would change"}.`,
);
console.log(`Descriptions migrated: ${totalStats.migratedDescription}`);
console.log(
  `Legacy permalinks migrated: ${totalStats.migratedLegacyPermalink}`,
);
console.log(`Legacy banners migrated: ${totalStats.migratedLegacyBanner}`);
console.log(`Draft states migrated: ${totalStats.migratedDraft}`);
console.log(
  `Missing descriptions left for review: ${totalStats.missingDescription}`,
);
console.log(`Authors normalized: ${totalStats.normalizedAuthor}`);
console.log(
  `Legacy categories merged into tags: ${totalStats.mergedLegacyCategories}`,
);
console.log(
  `Legacy category values dropped: ${totalStats.droppedLegacyCategories}`,
);
console.log(
  `Legacy categories renamed from old field: ${totalStats.migratedCategories}`,
);
console.log(
  `Duplicate fbpreview fields dropped: ${totalStats.droppedDuplicateFbpreview}`,
);

if (totalStats.removedFields.size > 0) {
  console.log("");
  console.log("Removed legacy fields:");
  for (const [key, count] of [...totalStats.removedFields.entries()].sort()) {
    console.log(`- ${key}: ${count}`);
  }
}

if (unresolvedByFile.length > 0) {
  console.log("");
  console.log("Preserved fields that still need manual review:");
  for (const item of unresolvedByFile) {
    console.log(`- ${item}`);
  }
}

if (!write) {
  console.log("");
  console.log("Dry run only. Re-run with --write to apply these changes.");
  process.exit(0);
}

const status = allowDirty ? "" : gitStatus(files.map((file) => relative(file)));
if (status !== "") {
  console.error("");
  console.error("Refusing to normalize because article files are not clean:");
  console.error(status);
  process.exit(1);
}

for (const change of changes) {
  await writeFile(change.file, change.text);
}

console.log("");
console.log("Article metadata normalization applied.");
