import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const rootDir = process.cwd();
const contentRoots = [
  path.resolve("src/content/articles"),
  path.resolve("src/content/pages"),
];
const markdownExtensionPattern = /\.(?:md|mdx|markdown)$/i;
const htmlBlockTagPattern =
  /<\/?\s*(?:blockquote|div|figcaption|figure|h[1-6]|iframe|img|li|p|span|table|tbody|td|th|thead|tr|ul)\b/i;
const markdownSensitiveTextPattern = /[`[\]]/;
const protectedBlockBoundaryPattern =
  /<\/?\s*(?:blockquote|div|figure|iframe|table|tbody|thead|tr|ul)\b/i;
const protectedBlockClosePattern =
  /<\/\s*(?:blockquote|div|figure|iframe|table|tbody|thead|tr|ul)\s*>/gi;
const protectedBlockOpenPattern =
  /<\s*(?:blockquote|div|figure|iframe|table|tbody|thead|tr|ul)\b(?![^>]*\/>)/gi;
const standaloneHrPattern = /^<hr\s*\/?>$/i;
const simpleHeadingPattern = /^<h([2-6])>([^<>]+)<\/h\1>$/i;
const simpleParagraphPattern = /^<p>([\s\S]*)<\/p>$/i;

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

function splitFrontmatter(text) {
  const firstLineEnd = text.indexOf("\n");

  if (firstLineEnd === -1 || text.slice(0, firstLineEnd).trim() !== "---") {
    return {
      body: text,
      frontmatter: "",
    };
  }

  const closingPattern = /\n---[^\S\r\n]*(?:\r?\n|$)/g;
  closingPattern.lastIndex = firstLineEnd + 1;

  const match = closingPattern.exec(text);
  if (!match) {
    return {
      body: text,
      frontmatter: "",
    };
  }

  const frontmatterEnd = match.index + match[0].length;

  return {
    body: text.slice(frontmatterEnd),
    frontmatter: text.slice(0, frontmatterEnd),
  };
}

function createStats() {
  return {
    addedIframeTitle: 0,
    addedImageAlt: 0,
    convertedBold: 0,
    convertedHorizontalRule: 0,
    convertedImage: 0,
    convertedItalic: 0,
    convertedLink: 0,
    convertedParagraph: 0,
    convertedSimpleHeading: 0,
    normalizedBaseUrl: 0,
    normalizedGlossaryLink: 0,
  };
}

function addStat(stats, key, count = 1) {
  stats[key] += count;
}

function mergeStats(total, item) {
  for (const key of Object.keys(total)) {
    total[key] += item[key];
  }
}

function nonZeroStats(stats) {
  return Object.entries(stats).filter(([, count]) => count > 0);
}

function replaceWithCount(text, pattern, replacement, stats, key) {
  return text.replace(pattern, (...match) => {
    addStat(stats, key);

    if (typeof replacement === "function") {
      return replacement(...match);
    }

    return replacement;
  });
}

function normalizeLegacyUrls(text, stats) {
  let next = replaceWithCount(
    text,
    /\{\{ site\.baseurl \}\}/g,
    "",
    stats,
    "normalizedBaseUrl",
  );

  next = replaceWithCount(
    next,
    /href=(["'])\/glossary\/#/g,
    (_match, quote) => `href=${quote}/articles/glossary-1-dot-0/#`,
    stats,
    "normalizedGlossaryLink",
  );

  next = replaceWithCount(
    next,
    /href=(["'])\/glossary\/(["'])/g,
    (_match, openQuote, closeQuote) =>
      `href=${openQuote}/articles/glossary-1-dot-0/${closeQuote}`,
    stats,
    "normalizedGlossaryLink",
  );

  next = replaceWithCount(
    next,
    /\]\(\/glossary\/#/g,
    "](/articles/glossary-1-dot-0/#",
    stats,
    "normalizedGlossaryLink",
  );

  return replaceWithCount(
    next,
    /\]\(\/glossary\/\)/g,
    "](/articles/glossary-1-dot-0/)",
    stats,
    "normalizedGlossaryLink",
  );
}

function addAttributeToOpeningTag(tag, name, value) {
  const attribute = ` ${name}=${JSON.stringify(value)}`;

  if (/\/\s*>$/.test(tag)) {
    return tag.replace(/\s*\/\s*>$/, `${attribute} />`);
  }

  return tag.replace(/\s*>$/, `${attribute}>`);
}

function addMissingAttribute(text, tagName, attributeName, value, stats, key) {
  const pattern = new RegExp(
    `<${tagName}\\b(?![^>]*\\b${attributeName}\\s*=)[^>]*>`,
    "gi",
  );

  return text.replace(pattern, (tag) => {
    addStat(stats, key);
    return addAttributeToOpeningTag(tag, attributeName, value);
  });
}

function normalizeLegacyAttributes(text, stats) {
  const withImageAlt = addMissingAttribute(
    text,
    "img",
    "alt",
    "",
    stats,
    "addedImageAlt",
  );

  return addMissingAttribute(
    withImageAlt,
    "iframe",
    "title",
    "Embedded content",
    stats,
    "addedIframeTitle",
  );
}

function isSafeMarkdownUrl(url) {
  return !/[()\s]/.test(url);
}

function isSafeMarkdownLabel(label) {
  return !/[\][\n]/.test(label) && label.trim() === label;
}

function convertLinks(text, stats) {
  return text.replace(
    /<a\s+href=(["'])([^"']+)\1>([^<>\n]+)<\/a>/gi,
    (match, _quote, url, label) => {
      if (!isSafeMarkdownUrl(url) || !isSafeMarkdownLabel(label)) {
        return match;
      }

      addStat(stats, "convertedLink");
      return `[${label}](${url})`;
    },
  );
}

function convertInlinePair(text, tags, marker, stats, key) {
  const pattern = new RegExp(`<(${tags})>([^<>\\n]+)<\\/\\1>`, "gi");

  return text.replace(pattern, (match, _tag, value) => {
    if (value.trim() !== value || value.includes(marker)) {
      return match;
    }

    addStat(stats, key);
    return `${marker}${value}${marker}`;
  });
}

function convertSimpleInlineHtml(text, stats) {
  let next = convertLinks(text, stats);
  next = convertInlinePair(next, "i|em", "_", stats, "convertedItalic");
  return convertInlinePair(next, "b|strong", "**", stats, "convertedBold");
}

function safeParagraphMarkdown(inner) {
  const stats = createStats();
  const hadInlineHtml = /<\/?\s*[a-z][^>]*>/i.test(inner);
  const converted = convertSimpleInlineHtml(inner, stats);

  if (/<\/?\s*[a-z][^>]*>/i.test(converted)) {
    return undefined;
  }

  if (!hadInlineHtml && markdownSensitiveTextPattern.test(converted)) {
    return undefined;
  }

  return {
    markdown: converted.trim(),
    stats,
  };
}

function parseAttributes(source) {
  const attributes = new Map();
  const attributePattern = /([a-z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/gi;
  const remainder = source
    .replace(attributePattern, (_match, name, _quote, value) => {
      attributes.set(name.toLowerCase(), value);
      return "";
    })
    .replace("/", "")
    .trim();

  if (remainder !== "") {
    return undefined;
  }

  return attributes;
}

function standaloneImageAttributes(line) {
  const lowerLine = line.toLowerCase();

  if (!lowerLine.startsWith("<img ") || !line.endsWith(">")) {
    return undefined;
  }

  return line.slice(4, -1).trim();
}

function safeMarkdownImage(line) {
  const source = standaloneImageAttributes(line);
  if (source === undefined) {
    return undefined;
  }

  const attributes = parseAttributes(source);
  if (!attributes) {
    return undefined;
  }

  const src = attributes.get("src");
  const alt = attributes.get("alt") ?? "";
  const allowedAttributes = new Set(["alt", "src"]);

  if (
    !src ||
    !isSafeMarkdownUrl(src) ||
    !isSafeMarkdownLabel(alt) ||
    [...attributes.keys()].some(
      (attribute) => !allowedAttributes.has(attribute),
    )
  ) {
    return undefined;
  }

  return `![${alt}](${src})`;
}

function lineResult(line, isBlock = false) {
  return {
    isBlock,
    line,
  };
}

function transformLine(line, stats) {
  const indentation = line.match(/^\s*/)?.[0] ?? "";
  const trimmed = line.trim();
  const heading = trimmed.match(simpleHeadingPattern);
  const paragraph = trimmed.match(simpleParagraphPattern);
  const image = safeMarkdownImage(trimmed);

  if (standaloneHrPattern.test(trimmed)) {
    addStat(stats, "convertedHorizontalRule");
    return lineResult(`${indentation}---`, true);
  }

  if (heading) {
    addStat(stats, "convertedSimpleHeading");
    return lineResult(
      `${indentation}${"#".repeat(Number(heading[1]))} ${heading[2]}`,
      true,
    );
  }

  if (paragraph) {
    const paragraphResult = safeParagraphMarkdown(paragraph[1] ?? "");
    if (paragraphResult !== undefined) {
      mergeStats(stats, paragraphResult.stats);
      addStat(stats, "convertedParagraph");
      return lineResult(`${indentation}${paragraphResult.markdown}`, true);
    }
  }

  if (image !== undefined) {
    addStat(stats, "convertedImage");
    return lineResult(`${indentation}${image}`, true);
  }

  if (!htmlBlockTagPattern.test(line)) {
    return lineResult(convertSimpleInlineHtml(line, stats));
  }

  return lineResult(line);
}

function isFenceStart(line) {
  return /^(?:```|~~~)/.test(line.trim());
}

function protectedBlockDelta(line) {
  const opens = [...line.matchAll(protectedBlockOpenPattern)].length;
  const closes = [...line.matchAll(protectedBlockClosePattern)].length;

  return opens - closes;
}

function appendOutputLine(output, result, state) {
  if (
    state.needsBlankAfterBlock &&
    result.line.trim() !== "" &&
    output.at(-1) !== undefined &&
    output.at(-1) !== ""
  ) {
    output.push("");
  }

  state.needsBlankAfterBlock = false;

  if (
    result.isBlock &&
    result.line.trim() !== "" &&
    output.at(-1) !== undefined &&
    output.at(-1) !== ""
  ) {
    output.push("");
  }

  output.push(result.line);
  state.needsBlankAfterBlock = result.isBlock && result.line.trim() !== "";
}

function transformMarkdownLines(text, stats) {
  const lines = text.split("\n");
  let inFence = false;
  let protectedBlockDepth = 0;
  const output = [];
  const state = {
    needsBlankAfterBlock: false,
  };

  for (const line of lines) {
    if (isFenceStart(line)) {
      inFence = !inFence;
      appendOutputLine(output, lineResult(line), state);
      continue;
    }

    if (inFence) {
      appendOutputLine(output, lineResult(line), state);
      continue;
    }

    const startsInProtectedBlock = protectedBlockDepth > 0;
    const hasProtectedBoundary = protectedBlockBoundaryPattern.test(line);
    protectedBlockDepth = Math.max(
      0,
      protectedBlockDepth + protectedBlockDelta(line),
    );

    if (startsInProtectedBlock || hasProtectedBoundary) {
      appendOutputLine(output, lineResult(line), state);
      continue;
    }

    appendOutputLine(output, transformLine(line, stats), state);
  }

  return output.join("\n");
}

function transformContent(text) {
  const stats = createStats();
  const { body, frontmatter } = splitFrontmatter(text);
  const normalizedBody = normalizeLegacyAttributes(
    normalizeLegacyUrls(body, stats),
    stats,
  );
  const nextBody = transformMarkdownLines(normalizedBody, stats);

  return {
    stats,
    text: `${frontmatter}${nextBody}`,
  };
}

function relative(file) {
  return path.relative(rootDir, file);
}

function printFileStats(file, stats) {
  const summary = nonZeroStats(stats)
    .map(([name, count]) => `${name}:${count}`)
    .join(", ");

  console.log(`${write ? "updated" : "would update"} ${relative(file)}`);
  console.log(`  ${summary}`);
}

async function normalizeFile(file) {
  const source = await readFile(file, "utf8");
  const result = transformContent(source);

  if (result.text === source) {
    return {
      changed: false,
      stats: result.stats,
    };
  }

  if (write) {
    await writeFile(file, result.text);
  }

  printFileStats(file, result.stats);

  return {
    changed: true,
    stats: result.stats,
  };
}

const files = (await Promise.all(contentRoots.map(listMarkdownFiles)))
  .flat()
  .sort();
const totalStats = createStats();
let changedFiles = 0;

for (const file of files) {
  const result = await normalizeFile(file);
  mergeStats(totalStats, result.stats);

  if (result.changed) {
    changedFiles += 1;
  }
}

console.log("");
console.log(
  `${write ? "Updated" : "Would update"} ${changedFiles} of ${files.length} Markdown files.`,
);

for (const [name, count] of nonZeroStats(totalStats)) {
  console.log(`- ${name}: ${count}`);
}
