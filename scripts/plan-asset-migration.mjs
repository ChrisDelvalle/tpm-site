import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const verbose = args.has("--verbose");
const rootDir = process.cwd();
const articlesDir = path.resolve("src/content/articles");
const assetsDir = path.resolve("src/assets");
const publicDir = path.resolve("public");
const markdownExtensionPattern = /\.mdx?$/i;
const imageExtensionPattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const supportedReferenceKinds = new Set([
  "frontmatter-image",
  "markdown-image",
]);
const frontmatterImageFields = new Set(["banner", "fbpreview", "image"]);

async function listFiles(dir, predicate) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, predicate)));
    } else if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(rootDir, file);
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function articleSlug(file) {
  return path.basename(file).replace(markdownExtensionPattern, "");
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

function frontmatterBody(text) {
  const match = text.match(
    /^(---[^\S\r\n]*\r?\n)([\s\S]*?)(\r?\n---[^\S\r\n]*(?:\r?\n)?)/,
  );

  if (!match) {
    return undefined;
  }

  return {
    body: match[2],
    startOffset: match[1].length,
  };
}

function unquoteYamlScalar(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function normalizeAssetReference(value) {
  let raw = value.trim();

  if (raw.startsWith("<") && raw.endsWith(">")) {
    raw = raw.slice(1, -1).trim();
  }

  raw = raw.replace(
    /^https?:\/\/(?:www\.)?thephilosophersmeme\.com(?=\/)/i,
    "",
  );

  if (!raw.startsWith("/assets/") && !raw.startsWith("/uploads/")) {
    return undefined;
  }

  const pathOnly = raw.split(/[?#]/, 1)[0] ?? raw;
  const decodedPath = safeDecodeUri(pathOnly);
  const sourcePath = path.join(publicDir, decodedPath.slice(1));

  return {
    hasQueryOrHash: pathOnly !== raw,
    sourcePath,
    urlPath: pathOnly,
  };
}

function addReference(references, reference) {
  const normalized = normalizeAssetReference(reference.value);

  if (normalized === undefined) {
    return;
  }

  references.push({
    ...reference,
    ...normalized,
  });
}

function findClosingMarkdownTarget(text, start) {
  if (text[start] === "<") {
    const close = text.indexOf(">)", start);
    return close === -1 ? undefined : close + 1;
  }

  const close = text.indexOf(")", start);
  return close === -1 ? undefined : close;
}

function markdownImageReferences(text, file, slug) {
  const references = [];
  let searchIndex = 0;

  while (searchIndex < text.length) {
    const imageStart = text.indexOf("![", searchIndex);

    if (imageStart === -1) {
      break;
    }

    const targetOpen = text.indexOf("](", imageStart + 2);

    if (targetOpen === -1) {
      searchIndex = imageStart + 2;
      continue;
    }

    const targetStart = targetOpen + 2;
    const targetEnd = findClosingMarkdownTarget(text, targetStart);

    if (targetEnd === undefined) {
      searchIndex = targetStart;
      continue;
    }

    const targetToken = text.slice(targetStart, targetEnd);
    const value =
      targetToken.startsWith("<") && targetToken.endsWith(">")
        ? targetToken.slice(1, -1)
        : targetToken;

    addReference(references, {
      articleSlug: slug,
      file,
      kind: "markdown-image",
      line: lineNumberAt(text, imageStart),
      targetToken,
      value,
    });

    searchIndex = targetEnd + 1;
  }

  return references;
}

function frontmatterImageReferences(text, file, slug) {
  const references = [];
  const frontmatter = frontmatterBody(text);

  if (frontmatter === undefined) {
    return references;
  }

  let offset = 0;
  for (const line of frontmatter.body.split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    const field = colonIndex === -1 ? "" : line.slice(0, colonIndex);

    if (!frontmatterImageFields.has(field)) {
      offset += line.length + 1;
      continue;
    }

    addReference(references, {
      articleSlug: slug,
      field,
      file,
      kind: "frontmatter-image",
      line: lineNumberAt(text, frontmatter.startOffset + offset),
      value: unquoteYamlScalar(line.slice(colonIndex + 1)),
    });

    offset += line.length + 1;
  }

  return references;
}

function isNameCharacter(value) {
  return /[\w-]/.test(value);
}

function attributeValue(tag, attribute) {
  const lowerTag = tag.toLowerCase();
  const lowerAttribute = attribute.toLowerCase();
  let searchIndex = 0;

  while (searchIndex < lowerTag.length) {
    const attributeIndex = lowerTag.indexOf(lowerAttribute, searchIndex);

    if (attributeIndex === -1) {
      return undefined;
    }

    const before = lowerTag[attributeIndex - 1] ?? "";
    const after = lowerTag[attributeIndex + lowerAttribute.length] ?? "";

    if (isNameCharacter(before) || isNameCharacter(after)) {
      searchIndex = attributeIndex + lowerAttribute.length;
      continue;
    }

    let cursor = attributeIndex + lowerAttribute.length;
    while (/\s/.test(lowerTag[cursor] ?? "")) {
      cursor += 1;
    }

    if (lowerTag[cursor] !== "=") {
      searchIndex = cursor;
      continue;
    }

    cursor += 1;
    while (/\s/.test(lowerTag[cursor] ?? "")) {
      cursor += 1;
    }

    const quote = tag[cursor];

    if (quote !== '"' && quote !== "'") {
      searchIndex = cursor;
      continue;
    }

    const valueStart = cursor + 1;
    const valueEnd = tag.indexOf(quote, valueStart);
    return valueEnd === -1 ? undefined : tag.slice(valueStart, valueEnd);
  }

  return undefined;
}

function htmlTags(text, tagName) {
  const tags = [];
  const lowerText = text.toLowerCase();
  const opener = `<${tagName.toLowerCase()}`;
  let searchIndex = 0;

  while (searchIndex < text.length) {
    const tagStart = lowerText.indexOf(opener, searchIndex);

    if (tagStart === -1) {
      break;
    }

    const afterName = lowerText[tagStart + opener.length] ?? "";
    if (isNameCharacter(afterName)) {
      searchIndex = tagStart + opener.length;
      continue;
    }

    const tagEnd = text.indexOf(">", tagStart);
    if (tagEnd === -1) {
      break;
    }

    tags.push({
      index: tagStart,
      source: text.slice(tagStart, tagEnd + 1),
    });
    searchIndex = tagEnd + 1;
  }

  return tags;
}

function rawHtmlImageReferences(text, file, slug) {
  const references = [];

  for (const tag of htmlTags(text, "img")) {
    addReference(references, {
      articleSlug: slug,
      file,
      kind: "raw-img",
      line: lineNumberAt(text, tag.index),
      value: attributeValue(tag.source, "src") ?? "",
    });
  }

  for (const tag of htmlTags(text, "a")) {
    const value = attributeValue(tag.source, "href") ?? "";
    const pathOnly = value.split(/[?#]/, 1)[0] ?? value;

    if (!imageExtensionPattern.test(pathOnly)) {
      continue;
    }

    addReference(references, {
      articleSlug: slug,
      file,
      kind: "raw-image-link",
      line: lineNumberAt(text, tag.index),
      value,
    });
  }

  return references;
}

function importReferences(text, file) {
  const references = [];
  let offset = 0;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/\bfrom\s+(['"])([^'"]+)\1/);
    const value = match?.[2] ?? "";

    if (!imageExtensionPattern.test(value)) {
      offset += line.length + 1;
      continue;
    }

    const sourcePath = path.resolve(path.dirname(file), value);
    const rootAssetPath = path.relative(rootDir, sourcePath);

    if (
      !rootAssetPath.startsWith(`assets${path.sep}`) &&
      !rootAssetPath.startsWith(`uploads${path.sep}`)
    ) {
      offset += line.length + 1;
      continue;
    }

    references.push({
      file,
      hasQueryOrHash: false,
      kind: "code-import",
      line: lineNumberAt(text, offset),
      sourcePath,
      targetToken: value,
      urlPath: `/${toPosix(rootAssetPath)}`,
      value,
    });

    offset += line.length + 1;
  }

  return references;
}

async function articleReferences(file) {
  const text = await readFile(file, "utf8");
  const slug = articleSlug(file);

  return [
    ...markdownImageReferences(text, file, slug),
    ...frontmatterImageReferences(text, file, slug),
    ...rawHtmlImageReferences(text, file, slug),
  ];
}

async function codeReferences() {
  const files = await listFiles(path.resolve("src"), (file) =>
    /\.(?:astro|[cm]?[jt]sx?)$/i.test(file),
  );
  const references = [];

  for (const file of files) {
    const text = await readFile(file, "utf8");
    references.push(...importReferences(text, file));
  }

  return references;
}

function destinationForReferences(sourcePath, references) {
  const articleSlugs = new Set(
    references
      .map((reference) => reference.articleSlug)
      .filter((slug) => typeof slug === "string" && slug !== ""),
  );
  const hasCodeReference = references.some(
    (reference) => reference.kind === "code-import",
  );
  const basename = path.basename(sourcePath);

  if (hasCodeReference && articleSlugs.size === 0) {
    return path.join(assetsDir, "site", basename);
  }

  if (articleSlugs.size === 1) {
    return path.join(assetsDir, "articles", [...articleSlugs][0], basename);
  }

  return path.join(assetsDir, "shared", basename);
}

function groupReferences(references) {
  const groups = new Map();

  for (const reference of references) {
    const key = reference.sourcePath;
    const group = groups.get(key);

    if (group === undefined) {
      groups.set(key, [reference]);
    } else {
      group.push(reference);
    }
  }

  return groups;
}

function referenceLabel(reference) {
  const articleSuffix =
    reference.articleSlug === undefined ? "" : ` (${reference.articleSlug})`;
  return `${relative(reference.file)}:${reference.line} ${reference.kind}${articleSuffix}`;
}

function blockedReasons(sourcePath, references) {
  const reasons = new Set();

  if (!existsSync(sourcePath)) {
    reasons.add("source file is missing");
  }

  for (const reference of references) {
    if (!supportedReferenceKinds.has(reference.kind)) {
      reasons.add(`has ${reference.kind} reference`);
    }

    if (reference.hasQueryOrHash) {
      reasons.add("has query string or hash reference");
    }
  }

  return [...reasons];
}

function destinationConflicts(plans) {
  const byDestination = new Map();

  for (const plan of plans) {
    const destination = plan.destinationPath;
    const owners = byDestination.get(destination);

    if (owners === undefined) {
      byDestination.set(destination, [plan.sourcePath]);
    } else {
      owners.push(plan.sourcePath);
    }
  }

  return [...byDestination.entries()]
    .map(([destination, sources]) => ({
      destination,
      sources: [...new Set(sources)],
    }))
    .filter((conflict) => conflict.sources.length > 1);
}

function createPlans(groups) {
  return [...groups.entries()].map(([sourcePath, references]) => {
    const destinationPath = destinationForReferences(sourcePath, references);

    return {
      destinationPath,
      reasons: blockedReasons(sourcePath, references),
      references,
      sourcePath,
    };
  });
}

function printReferenceList(references) {
  for (const reference of references) {
    console.log(`    - ${referenceLabel(reference)}`);
  }
}

function printPlanSection(title, plans) {
  console.log("");
  console.log(`${title}: ${plans.length}`);

  if (!verbose) {
    return;
  }

  for (const plan of plans) {
    console.log(
      `  ${relative(plan.sourcePath)} -> ${relative(plan.destinationPath)}`,
    );
    if (plan.reasons.length > 0) {
      console.log(`    reasons: ${plan.reasons.join(", ")}`);
    }
    printReferenceList(plan.references);
  }
}

function countBy(values) {
  const counts = new Map();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function printCounts(title, counts) {
  console.log("");
  console.log(title);

  for (const [label, count] of counts) {
    console.log(`  ${label}: ${count}`);
  }
}

function markdownAssetReference(file, destinationPath) {
  const assetPath = toPosix(path.relative(path.dirname(file), destinationPath));
  const relativePath = assetPath.startsWith(".") ? assetPath : `./${assetPath}`;

  return `<${relativePath}>`;
}

function frontmatterAssetReference(file, destinationPath) {
  const assetPath = toPosix(path.relative(path.dirname(file), destinationPath));
  return assetPath.startsWith(".") ? assetPath : `./${assetPath}`;
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

function gitMv(from, to) {
  const result = spawnSync("git", ["mv", "--", from, to], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function replaceFrontmatterReference(text, reference, destinationPath) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const lineIndex = reference.line - 1;
  const line = lines[lineIndex];

  if (line === undefined) {
    throw new Error(`${relative(reference.file)}:${reference.line} is missing`);
  }

  const colonIndex = line.indexOf(":");
  const field = colonIndex === -1 ? "" : line.slice(0, colonIndex);

  if (field !== reference.field) {
    throw new Error(
      `${relative(reference.file)}:${reference.line} expected ${reference.field} frontmatter field`,
    );
  }

  lines[lineIndex] = `${field}: ${JSON.stringify(
    frontmatterAssetReference(reference.file, destinationPath),
  )}`;
  return lines.join(newline);
}

async function applyReferenceUpdates(plans) {
  const replacementsByFile = new Map();

  for (const plan of plans) {
    for (const reference of plan.references) {
      const replacements = replacementsByFile.get(reference.file) ?? [];

      if (reference.kind === "markdown-image") {
        replacements.push({
          destinationPath: plan.destinationPath,
          from: reference.targetToken,
          kind: reference.kind,
          to: markdownAssetReference(reference.file, plan.destinationPath),
        });
      } else if (reference.kind === "frontmatter-image") {
        replacements.push({
          destinationPath: plan.destinationPath,
          kind: reference.kind,
          reference,
        });
      }

      replacementsByFile.set(reference.file, replacements);
    }
  }

  for (const [file, replacements] of replacementsByFile.entries()) {
    let text = await readFile(file, "utf8");

    for (const replacement of replacements) {
      if (replacement.kind === "markdown-image") {
        text = text.replaceAll(replacement.from, replacement.to);
      } else {
        text = replaceFrontmatterReference(
          text,
          replacement.reference,
          replacement.destinationPath,
        );
      }
    }

    await writeFile(file, text);
  }
}

const articleFiles = await listFiles(articlesDir, (file) =>
  markdownExtensionPattern.test(file),
);
const references = [
  ...(await Promise.all(articleFiles.map(articleReferences))).flat(),
  ...(await codeReferences()),
];
const groups = groupReferences(references);
const plans = createPlans(groups);
const conflicts = destinationConflicts(plans);
const conflictDestinationPaths = new Set(
  conflicts.map((conflict) => conflict.destination),
);
const movablePlans = plans.filter(
  (plan) =>
    plan.reasons.length === 0 &&
    !conflictDestinationPaths.has(plan.destinationPath),
);
const blockedPlans = plans.filter(
  (plan) =>
    plan.reasons.length > 0 ||
    conflictDestinationPaths.has(plan.destinationPath),
);

console.log(
  write ? "Applying asset migration plan." : "Planning asset migration.",
);
console.log(`${articleFiles.length} article files scanned.`);
console.log(`${references.length} local legacy asset references found.`);
console.log(`${plans.length} referenced asset files found.`);
console.log(
  `${conflicts.length} destination conflict${conflicts.length === 1 ? "" : "s"} found.`,
);

printCounts(
  "Reference kinds:",
  countBy(references.map((reference) => reference.kind)),
);
printCounts(
  "Manual reasons:",
  countBy(blockedPlans.flatMap((plan) => plan.reasons)),
);

printPlanSection("Movable assets", movablePlans);
printPlanSection("Manual assets", blockedPlans);

if (conflicts.length > 0) {
  console.log("");
  console.log("Conflicts:");
  for (const conflict of conflicts) {
    console.log(`  ${relative(conflict.destination)}`);
    for (const source of conflict.sources) {
      console.log(`    - ${relative(source)}`);
    }
  }
}

if (!write) {
  console.log("");
  console.log("Dry run only. Re-run with --write to move safe assets.");
  console.log(
    "Use --verbose to print every planned move and manual reference.",
  );
  process.exit(0);
}

if (movablePlans.length === 0) {
  console.log("No safe asset moves to apply.");
  process.exit(0);
}

const involvedPaths = [
  ...new Set(
    movablePlans.flatMap((plan) => [plan.sourcePath, plan.destinationPath]),
  ),
];
const status = gitStatus(involvedPaths);

if (status !== "") {
  console.error("");
  console.error("Refusing to migrate because involved files are not clean:");
  console.error(status);
  process.exit(1);
}

for (const plan of movablePlans) {
  await mkdir(path.dirname(plan.destinationPath), { recursive: true });
  gitMv(plan.sourcePath, plan.destinationPath);
}

await applyReferenceUpdates(movablePlans);

console.log("");
console.log(
  `Applied ${movablePlans.length} safe asset move${movablePlans.length === 1 ? "" : "s"}.`,
);
if (blockedPlans.length > 0) {
  console.log(
    `${blockedPlans.length} asset${blockedPlans.length === 1 ? "" : "s"} still require manual handling.`,
  );
}
