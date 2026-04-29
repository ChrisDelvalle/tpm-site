import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const docsDir = path.resolve("docs");
const datedPermalinkPattern = /^\/?\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/;
const datePrefixPattern = /^\d{4}[-_]\d{2}[-_]\d{2}[-_]/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (/\.(?:md|markdown)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(process.cwd(), file);
}

function permalinkSlug(value) {
  return typeof value === "string"
    ? value.match(datedPermalinkPattern)?.[1]
    : undefined;
}

function filenameSlug(file) {
  return path
    .basename(file)
    .replace(/\.(?:md|markdown)$/i, "")
    .replace(datePrefixPattern, "");
}

function normalizeFrontmatter(text) {
  const match = text.match(/^---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*/);
  if (!match) {
    return text;
  }

  const lines = match[1].split("\n");
  const lastTopLevelKeyLine = new Map();

  lines.forEach((line, index) => {
    const key = line.match(/^([\w-]+):(?:\s|$)/)?.[1];
    if (key) {
      lastTopLevelKeyLine.set(key, index);
    }
  });

  const normalized = lines.filter((line, index) => {
    const key = line.match(/^([\w-]+):(?:\s|$)/)?.[1];
    return !key || lastTopLevelKeyLine.get(key) === index;
  });

  return `---\n${normalized.join("\n")}\n---\n${text.slice(match[0].length)}`;
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

const files = await listMarkdownFiles(docsDir);
const moves = [];
const issues = [];
const targetOwners = new Map();

for (const file of files) {
  const source = await readFile(file, "utf8");
  const { data } = matter(normalizeFrontmatter(source));
  const slug = permalinkSlug(data.permalink);

  if (!slug) {
    continue;
  }

  if (!slugPattern.test(slug)) {
    issues.push(`${relative(file)}: permalink slug is not URL-safe: ${slug}`);
    continue;
  }

  const target = path.join(path.dirname(file), `${slug}.md`);
  const move = {
    from: relative(file),
    targetSlug: slug,
    to: relative(target),
    wouldChangeFilenameSlug: filenameSlug(file) !== slug,
  };

  const previous = targetOwners.get(move.to);
  if (previous && previous !== move.from) {
    issues.push(`duplicate target ${move.to}: ${previous} and ${move.from}`);
  } else {
    targetOwners.set(move.to, move.from);
  }

  if (move.from !== move.to) {
    moves.push(move);
  }
}

if (issues.length > 0) {
  console.error("Article rename plan failed.");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

const changedSlugMoves = moves.filter((move) => move.wouldChangeFilenameSlug);

console.log(
  `${write ? "Applying" : "Planning"} ${moves.length} article file rename${
    moves.length === 1 ? "" : "s"
  }.`,
);
console.log(`${files.length} Markdown files scanned under docs/.`);

if (changedSlugMoves.length > 0) {
  console.log("");
  console.log(
    `${changedSlugMoves.length} target filename slug${
      changedSlugMoves.length === 1 ? "" : "s"
    } come from permalink rather than date-stripped filename:`,
  );
  for (const move of changedSlugMoves) {
    console.log(`- ${move.from} -> ${move.to}`);
  }
}

if (moves.length > 0) {
  console.log("");
  for (const move of moves) {
    console.log(`${move.from} -> ${move.to}`);
  }
}

if (!write) {
  console.log("");
  console.log("Dry run only. Re-run with --write to apply these git moves.");
  process.exit(0);
}

const touchedPaths = [
  ...new Set(moves.flatMap((move) => [move.from, move.to])),
];
const status = gitStatus(touchedPaths);
if (status) {
  console.error("");
  console.error("Refusing to rename because involved files are not clean:");
  console.error(status);
  process.exit(1);
}

for (const move of moves) {
  gitMv(move.from, move.to);
}

console.log("");
console.log("Article file renames applied.");
