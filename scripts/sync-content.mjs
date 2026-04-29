import {
  access,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const legacyDocsDir = path.resolve("docs");
const articleSourceDir = path.resolve("src/content/articles");
const targetDir = path.resolve("src/content/legacy");

async function directoryExists(dir) {
  try {
    await access(dir);
    return true;
  } catch {
    return false;
  }
}

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

await rm(targetDir, { force: true, recursive: true });

async function copyMarkdownSource(sourceDir) {
  if (!(await directoryExists(sourceDir))) {
    return;
  }

  for (const file of await listMarkdownFiles(sourceDir)) {
    const relativePath = path.relative(sourceDir, file);
    const normalizedPath = relativePath.replace(/\.markdown$/i, ".md");
    const target = path.join(targetDir, normalizedPath);
    const source = await readFile(file, "utf8");

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, normalizeFrontmatter(source));
  }
}

await copyMarkdownSource(legacyDocsDir);
await copyMarkdownSource(articleSourceDir);
