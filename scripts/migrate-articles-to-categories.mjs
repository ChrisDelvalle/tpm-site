import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const rootDir = process.cwd();
const docsDir = path.resolve("docs");
const articlesDir = path.resolve("src/content/articles");
const datedPermalinkPattern = /^\/?\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/;
const categoryBySourceFolder = new Map([
  ["aesthetics", "aesthetics"],
  ["game studies", "game-studies"],
  ["history", "history"],
  ["irony", "irony"],
  ["memeculture", "memeculture"],
  ["metamemetics", "metamemetics"],
  ["philosophy", "philosophy"],
  ["politics", "politics"],
]);
const categorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const filenameSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/;

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
    open: match[1],
    body: match[2],
    close: match[3],
    full: match[0],
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

function topLevelValue(lines, key) {
  let value;
  for (const line of lines) {
    const match = /^([\w-]+):(.*)$/.exec(line);
    if (match?.[1] === key) {
      value = unquoteYamlScalar(match[2] ?? "");
    }
  }
  return value;
}

function removeTopicLine(text, expectedCategory) {
  const parts = frontmatterParts(text);
  if (!parts) {
    return { changed: false, text };
  }

  const newline =
    parts.open.includes("\r\n") || parts.body.includes("\r\n") ? "\r\n" : "\n";
  const lines = parts.body.split(/\r?\n/);
  const nextLines = [];
  let changed = false;

  for (const line of lines) {
    const match = /^topic:(.*)$/.exec(line);
    if (!match) {
      nextLines.push(line);
      continue;
    }

    const topic = unquoteYamlScalar(match[1] ?? "");
    if (topic !== expectedCategory) {
      throw new Error(
        `Unexpected topic "${topic}", expected "${expectedCategory}".`,
      );
    }

    changed = true;
  }

  if (!changed) {
    return { changed: false, text };
  }

  return {
    changed: true,
    text: `${parts.open}${nextLines.join(newline)}${parts.close}${text.slice(
      parts.full.length,
    )}`,
  };
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

function runGit(args_) {
  const result = spawnSync("git", args_, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const files = await listMarkdownFiles(docsDir);
const moves = [];
const issues = [];
const targetOwners = new Map();
const filenameOwners = new Map();

for (const file of files) {
  const source = await readFile(file, "utf8");
  const parts = frontmatterParts(source);
  if (!parts) {
    continue;
  }

  const lines = parts.body.split(/\r?\n/);
  const permalink = topLevelValue(lines, "permalink");
  if (!datedPermalinkPattern.test(permalink ?? "")) {
    continue;
  }

  const sourceFolder = path.relative(docsDir, file).split(path.sep)[0] ?? "";
  const category = categoryBySourceFolder.get(sourceFolder);
  if (!category) {
    issues.push(`${relative(file)}: unknown article category folder`);
    continue;
  }

  if (!categorySlugPattern.test(category)) {
    issues.push(`${relative(file)}: category is not URL-safe: ${category}`);
    continue;
  }

  const filename = path.basename(file);
  if (!filenameSlugPattern.test(filename)) {
    issues.push(`${relative(file)}: filename is not URL-safe: ${filename}`);
    continue;
  }

  const target = path.join(articlesDir, category, filename);
  const move = {
    category,
    filename,
    from: relative(file),
    to: relative(target),
  };

  const previousTarget = targetOwners.get(move.to);
  if (previousTarget && previousTarget !== move.from) {
    issues.push(`duplicate target ${move.to}: ${previousTarget}, ${move.from}`);
  } else {
    targetOwners.set(move.to, move.from);
  }

  const previousFilename = filenameOwners.get(filename);
  if (previousFilename && previousFilename !== move.from) {
    issues.push(
      `duplicate public article slug from filename ${filename}: ${previousFilename}, ${move.from}`,
    );
  } else {
    filenameOwners.set(filename, move.from);
  }

  moves.push(move);
}

if (issues.length > 0) {
  console.error("Article category migration failed.");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `${write ? "Applying" : "Planning"} ${moves.length} article category migration${
    moves.length === 1 ? "" : "s"
  }.`,
);
console.log(`${files.length} Markdown/MDX files scanned under docs/.`);

for (const move of moves) {
  console.log(`${move.from} -> ${move.to}`);
}

if (!write) {
  console.log("");
  console.log("Dry run only. Re-run with --write to apply these moves.");
  process.exit(0);
}

const involvedPaths = [
  ...new Set(moves.flatMap((move) => [move.from, move.to])),
];
const status = gitStatus(involvedPaths);
if (status) {
  console.error("");
  console.error("Refusing to migrate because involved files are not clean:");
  console.error(status);
  process.exit(1);
}

for (const move of moves) {
  await mkdir(path.dirname(move.to), { recursive: true });
  runGit(["mv", "--", move.from, move.to]);

  const targetText = await readFile(move.to, "utf8");
  const result = removeTopicLine(targetText, move.category);
  if (result.changed) {
    await writeFile(move.to, result.text);
    runGit(["add", "--", move.to]);
  }
}

console.log("");
console.log("Article category migration applied.");
