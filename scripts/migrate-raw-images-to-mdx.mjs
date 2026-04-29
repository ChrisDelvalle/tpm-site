import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
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

function ensureRelativeImportPath(file) {
  return file.startsWith(".") ? file : `./${file}`;
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
    endOffset: match[0].length,
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

function normalizeLegacyLocalAssetReference(value) {
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

  return {
    sourcePath: path.join(publicDir, decodedPath.slice(1)),
    value: raw,
  };
}

function addReference(references, reference) {
  const normalized = normalizeLegacyLocalAssetReference(reference.value);

  if (normalized === undefined) {
    return;
  }

  references.push({
    ...reference,
    ...normalized,
  });
}

function isNameCharacter(value) {
  return /[\w-]/.test(value);
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
      end: tagEnd + 1,
      index: tagStart,
      source: text.slice(tagStart, tagEnd + 1),
    });
    searchIndex = tagEnd + 1;
  }

  return tags;
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

function parseAttributes(tag) {
  const body = tag
    .replace(/^<\s*\w+/, "")
    .replace(/\/?\s*>$/, "")
    .trim();
  const attributes = [];
  const attributePattern = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;

  for (const match of body.matchAll(attributePattern)) {
    attributes.push({
      name: match[1],
      value: match[2] ?? match[3],
    });
  }

  return attributes;
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function renderAttribute(name, value) {
  if (value === undefined) {
    return name;
  }

  if ((name === "height" || name === "width") && /^\d+$/.test(value)) {
    return `${name}={${Number(value)}}`;
  }

  if (
    (name === "height" || name === "width") &&
    value.trim().toLowerCase() === "auto"
  ) {
    return undefined;
  }

  return `${name}="${escapeAttribute(value)}"`;
}

function imageComponent(tag, importName) {
  const attributes = parseAttributes(tag);
  const rendered = [`src={${importName}}`];
  const alt = attributes.find(
    (attribute) => attribute.name.toLowerCase() === "alt",
  );

  rendered.push(`alt="${escapeAttribute(alt?.value ?? "")}"`);

  for (const attribute of attributes) {
    const name = attribute.name.toLowerCase();

    if (name === "src" || name === "alt") {
      continue;
    }

    const renderedAttribute = renderAttribute(attribute.name, attribute.value);
    if (renderedAttribute !== undefined) {
      rendered.push(renderedAttribute);
    }
  }

  return `<Image ${rendered.join(" ")} />`;
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
      index: frontmatter.startOffset + offset,
      kind: "frontmatter-image",
      line: lineNumberAt(text, frontmatter.startOffset + offset),
      value: unquoteYamlScalar(line.slice(colonIndex + 1)),
    });

    offset += line.length + 1;
  }

  return references;
}

function rawHtmlImageReferences(text, file, slug) {
  const references = [];

  for (const tag of htmlTags(text, "img")) {
    addReference(references, {
      articleSlug: slug,
      file,
      index: tag.index,
      kind: "raw-img",
      line: lineNumberAt(text, tag.index),
      tag: tag.source,
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
      index: tag.index,
      kind: "raw-image-link",
      line: lineNumberAt(text, tag.index),
      tag: tag.source,
      value,
    });
  }

  return references;
}

async function articleReferences(file) {
  const text = await readFile(file, "utf8");
  const slug = articleSlug(file);

  return [
    ...frontmatterImageReferences(text, file, slug),
    ...rawHtmlImageReferences(text, file, slug),
  ];
}

function destinationForReferences(sourcePath, references) {
  const articleSlugs = new Set(
    references
      .map((reference) => reference.articleSlug)
      .filter((slug) => typeof slug === "string" && slug !== ""),
  );
  const basename = path.basename(sourcePath);

  if (articleSlugs.size === 1) {
    return path.join(assetsDir, "articles", [...articleSlugs][0], basename);
  }

  return path.join(assetsDir, "shared", basename);
}

function groupReferences(references) {
  const groups = new Map();

  for (const reference of references) {
    const group = groups.get(reference.sourcePath);

    if (group === undefined) {
      groups.set(reference.sourcePath, [reference]);
    } else {
      group.push(reference);
    }
  }

  return groups;
}

function createPlans(groups) {
  return [...groups.entries()]
    .filter(([, references]) =>
      references.some((reference) =>
        ["raw-image-link", "raw-img"].includes(reference.kind),
      ),
    )
    .map(([sourcePath, references]) => ({
      destinationPath: destinationForReferences(sourcePath, references),
      references,
      sourcePath,
    }));
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

function importPath(file, destinationPath) {
  return ensureRelativeImportPath(
    toPosix(path.relative(path.dirname(file), destinationPath)),
  );
}

function frontmatterAssetReference(file, destinationPath) {
  return JSON.stringify(importPath(file, destinationPath));
}

function replacementImportName(imports, destinationPath) {
  const existing = imports.get(destinationPath);

  if (existing !== undefined) {
    return existing;
  }

  const name = `articleImage${String(imports.size + 1).padStart(2, "0")}`;
  imports.set(destinationPath, name);
  return name;
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

  lines[lineIndex] =
    `${field}: ${frontmatterAssetReference(reference.file, destinationPath)}`;
  return lines.join(newline);
}

function replaceAttributeWithExpression(tag, attribute, expression) {
  const pattern = new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i");
  return tag.replace(pattern, `${attribute}={${expression}}`);
}

function insertImports(text, file, imports) {
  if (imports.size === 0) {
    return text;
  }

  const frontmatter = frontmatterBody(text);
  const insertionPoint = frontmatter?.endOffset ?? 0;
  const importLines = [
    'import { Image } from "astro:assets";',
    ...[...imports.entries()].map(
      ([destinationPath, importName]) =>
        `import ${importName} from "${importPath(file, destinationPath)}";`,
    ),
  ];
  const before = text.slice(0, insertionPoint).replace(/\s*$/, "\n");
  const after = text.slice(insertionPoint).replace(/^\s*/, "\n");

  return `${before}\n${importLines.join("\n")}\n${after}`;
}

function applyFileReplacements(text, replacements) {
  let output = text;

  for (const replacement of replacements.sort(
    (left, right) => right.index - left.index,
  )) {
    output =
      output.slice(0, replacement.index) +
      replacement.to +
      output.slice(replacement.index + replacement.from.length);
  }

  return output;
}

function rewrittenFilePath(file) {
  return file.replace(/\.md$/i, ".mdx");
}

function replacementForReference(plan, reference, importsByFile) {
  if (reference.kind === "frontmatter-image") {
    return {
      from: "",
      index: reference.index,
      kind: reference.kind,
      reference,
      to: "",
    };
  }

  const imports = importsByFile.get(reference.file) ?? new Map();
  const importName = replacementImportName(imports, plan.destinationPath);
  importsByFile.set(reference.file, imports);

  if (reference.kind === "raw-img") {
    return {
      from: reference.tag,
      index: reference.index,
      to: imageComponent(reference.tag, importName),
    };
  }

  if (reference.kind === "raw-image-link") {
    return {
      from: reference.tag,
      index: reference.index,
      to: replaceAttributeWithExpression(
        reference.tag,
        "href",
        `${importName}.src`,
      ),
    };
  }

  return undefined;
}

function groupArticleReplacements(plans) {
  const replacementsByFile = new Map();
  const importsByFile = new Map();

  for (const plan of plans) {
    for (const reference of plan.references) {
      const replacement = replacementForReference(
        plan,
        reference,
        importsByFile,
      );

      if (replacement === undefined) {
        continue;
      }

      const replacements = replacementsByFile.get(reference.file) ?? [];
      replacements.push(replacement);
      replacementsByFile.set(reference.file, replacements);
    }
  }

  return { importsByFile, replacementsByFile };
}

function planForFrontmatterReplacement(plans, replacement) {
  const plan = plans.find((item) =>
    item.references.includes(replacement.reference),
  );

  if (plan === undefined) {
    throw new Error("Missing frontmatter replacement plan.");
  }

  return plan;
}

async function rewriteArticleFile(file, replacements, imports, plans) {
  let text = await readFile(file, "utf8");
  const frontmatterReplacements = replacements.filter(
    (replacement) => replacement.kind === "frontmatter-image",
  );
  const tagReplacements = replacements.filter(
    (replacement) => replacement.kind !== "frontmatter-image",
  );

  text = applyFileReplacements(text, tagReplacements);

  for (const replacement of frontmatterReplacements) {
    const plan = planForFrontmatterReplacement(plans, replacement);

    text = replaceFrontmatterReference(
      text,
      replacement.reference,
      plan.destinationPath,
    );
  }

  text = insertImports(text, file, imports);

  const targetFile = imports.size === 0 ? file : rewrittenFilePath(file);

  if (file !== targetFile) {
    if (existsSync(targetFile)) {
      throw new Error(`${relative(targetFile)} already exists.`);
    }
    await rename(file, targetFile);
  }

  await writeFile(targetFile, text);
}

async function rewriteArticleFiles(plans) {
  const { importsByFile, replacementsByFile } = groupArticleReplacements(plans);

  for (const [file, replacements] of replacementsByFile.entries()) {
    await rewriteArticleFile(
      file,
      replacements,
      importsByFile.get(file) ?? new Map(),
      plans,
    );
  }
}

async function moveAssets(plans) {
  for (const plan of plans) {
    await mkdir(path.dirname(plan.destinationPath), { recursive: true });
    await rename(plan.sourcePath, plan.destinationPath);
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
    for (const reference of plan.references) {
      console.log(
        `    - ${relative(reference.file)}:${reference.line} ${reference.kind}`,
      );
    }
  }
}

const articleFiles = await listFiles(articlesDir, (file) =>
  markdownExtensionPattern.test(file),
);
const references = (
  await Promise.all(articleFiles.map((file) => articleReferences(file)))
).flat();
const rawReferences = references.filter((reference) =>
  ["raw-image-link", "raw-img"].includes(reference.kind),
);
const plans = createPlans(groupReferences(references));
const conflicts = destinationConflicts(plans);
const conflictDestinationPaths = new Set(
  conflicts.map((conflict) => conflict.destination),
);
const blockedPlans = plans.filter(
  (plan) =>
    !existsSync(plan.sourcePath) ||
    existsSync(plan.destinationPath) ||
    conflictDestinationPaths.has(plan.destinationPath),
);
const blockedPaths = new Set(blockedPlans.map((plan) => plan.sourcePath));
const movablePlans = plans.filter((plan) => !blockedPaths.has(plan.sourcePath));
const filesToConvert = new Set(
  rawReferences.map((reference) => rewrittenFilePath(reference.file)),
);

console.log(
  write ? "Applying MDX image migration." : "Planning MDX image migration.",
);
console.log(`${articleFiles.length} article files scanned.`);
console.log(`${rawReferences.length} local raw image references found.`);
console.log(`${filesToConvert.size} article files will be MDX.`);
console.log(`${plans.length} referenced asset files found.`);
console.log(`${conflicts.length} destination conflicts found.`);

printPlanSection("Movable assets", movablePlans);
printPlanSection("Blocked assets", blockedPlans);

if (conflicts.length > 0 && verbose) {
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
  console.log(
    "Dry run only. Re-run with --write to migrate raw images to MDX.",
  );
  process.exit(0);
}

if (blockedPlans.length > 0) {
  console.error("Refusing to write while blocked assets remain.");
  process.exit(1);
}

await moveAssets(movablePlans);
await rewriteArticleFiles(movablePlans);

console.log("");
console.log(
  `Migrated ${movablePlans.length} asset${movablePlans.length === 1 ? "" : "s"} and ${filesToConvert.size} article file${filesToConvert.size === 1 ? "" : "s"} to MDX.`,
);
