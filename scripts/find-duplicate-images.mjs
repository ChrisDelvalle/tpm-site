import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const defaultScanDirs = ["src/assets", "public", "assets", "uploads"];
const imageExtensionPattern =
  /\.(?:avif|gif|jpe?g|png|svg|webp|bmp|ico|tiff?)$/i;
const args = process.argv.slice(2);
const json = args.includes("--json");
const failOnDuplicates = args.includes("--fail-on-duplicates");
const help = args.includes("--help") || args.includes("-h");
const scanDirs = args.filter((arg) => !arg.startsWith("--"));

if (help) {
  console.log(`Usage: bun run assets:duplicates [--json] [--fail-on-duplicates] [dir ...]

Find image files with identical byte content.

Defaults to:
${defaultScanDirs.map((dir) => `- ${dir}`).join("\n")}
`);
  process.exit(0);
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function relative(file) {
  return toPosix(path.relative(rootDir, file));
}

async function pathExists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function listImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(fullPath)));
    } else if (imageExtensionPattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function sha256(file) {
  const hash = createHash("sha256");
  const stream = createReadStream(file);

  await new Promise((resolve, reject) => {
    stream.on("data", (chunk) => {
      hash.update(chunk);
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  return hash.digest("hex");
}

async function imageRecord(file) {
  const fileStats = await stat(file);

  return {
    hash: await sha256(file),
    path: relative(file),
    size: fileStats.size,
  };
}

function groupDuplicates(records) {
  const byHash = new Map();

  for (const record of records) {
    const group = byHash.get(record.hash) ?? [];
    group.push(record);
    byHash.set(record.hash, group);
  }

  return [...byHash.values()]
    .filter((group) => group.length > 1)
    .sort((left, right) => {
      const sizeDelta = right[0].size - left[0].size;

      if (sizeDelta !== 0) {
        return sizeDelta;
      }

      return left[0].path.localeCompare(right[0].path);
    });
}

function printTextReport(duplicates, imageCount) {
  if (duplicates.length === 0) {
    console.log(`No duplicate images found across ${imageCount} image files.`);
    return;
  }

  const duplicateFileCount = duplicates.reduce(
    (count, group) => count + group.length,
    0,
  );
  console.log(
    `Found ${duplicates.length} duplicate image groups across ${duplicateFileCount} files.`,
  );

  for (const [index, group] of duplicates.entries()) {
    const [{ hash, size }] = group;
    console.log(`\nGroup ${index + 1}: ${size} bytes, sha256 ${hash}`);

    for (const record of group) {
      console.log(`- ${record.path}`);
    }
  }
}

const requestedDirs = scanDirs.length > 0 ? scanDirs : defaultScanDirs;
const existingDirs = [];

for (const dir of requestedDirs) {
  const fullPath = path.resolve(dir);

  if (await pathExists(fullPath)) {
    existingDirs.push(fullPath);
  }
}

const imageFiles = [];
for (const dir of existingDirs) {
  imageFiles.push(...(await listImageFiles(dir)));
}

const records = [];
for (const file of imageFiles.sort()) {
  records.push(await imageRecord(file));
}

const duplicates = groupDuplicates(records);

if (json) {
  console.log(
    JSON.stringify(
      {
        duplicateGroups: duplicates,
        imageCount: records.length,
        scanDirs: existingDirs.map(relative),
      },
      null,
      2,
    ),
  );
} else {
  printTextReport(duplicates, records.length);
}

if (failOnDuplicates && duplicates.length > 0) {
  process.exit(1);
}
