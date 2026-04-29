import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const scanDirs = ["src/assets", "public", "assets", "uploads", "unused-assets"];
const sourceDirs = ["src/pages", "src/components", "src/layouts", "src/lib"];
const activePrefixes = ["src/assets/", "public/"];
const legacyPrefixes = ["assets/", "uploads/", "unused-assets/"];
const imageExtensionPattern =
  /\.(?:avif|gif|jpe?g|png|svg|webp|bmp|ico|tiff?)$/i;
const textExtensionPattern = /\.(?:astro|css|js|jsx|md|mdx|mjs|ts|tsx)$/i;
const relativePathPattern =
  /(?<quote>["'(<])(?<target>\.\.?\/[^"'()\n<>]+\.(?:avif|gif|jpe?g|png|svg|webp|bmp|ico|tiff?))["')>]/gi;
const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const help = args.has("--help") || args.has("-h");

if (help) {
  console.log(`Usage: bun scripts/prune-unused-duplicate-images.mjs [--write]

Find exact duplicate image files and remove only unused legacy copies.

Keeps:
- files under src/assets/
- files under public/
- root assets/uploads files still imported by runtime source files

Without --write, prints the removal plan only.
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

async function listExistingFiles(dirs, predicate) {
  const files = [];

  for (const dir of dirs) {
    const fullPath = path.resolve(dir);

    if (await pathExists(fullPath)) {
      files.push(...(await listFiles(fullPath, predicate)));
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

function isActivePath(file) {
  return activePrefixes.some((prefix) => file.startsWith(prefix));
}

function isLegacyPath(file) {
  return legacyPrefixes.some((prefix) => file.startsWith(prefix));
}

function isRootLegacyPath(file) {
  return file.startsWith("assets/") || file.startsWith("uploads/");
}

function keepRank(file) {
  if (isActivePath(file)) {
    return 0;
  }

  if (file.startsWith("unused-assets/")) {
    return 1;
  }

  if (file.startsWith("assets/")) {
    return 2;
  }

  if (file.startsWith("uploads/")) {
    return 3;
  }

  return 4;
}

function sortRecords(records) {
  return [...records].sort((left, right) => {
    const rankDelta = keepRank(left.path) - keepRank(right.path);

    if (rankDelta !== 0) {
      return rankDelta;
    }

    return left.path.localeCompare(right.path);
  });
}

function addResolvedRuntimeReference(protectedPaths, sourceFile, target) {
  const resolved = relative(path.resolve(path.dirname(sourceFile), target));

  if (isRootLegacyPath(resolved)) {
    protectedPaths.add(resolved);
  }
}

async function protectedLegacyPaths() {
  const protectedPaths = new Set();
  const files = await listExistingFiles(sourceDirs, (file) =>
    textExtensionPattern.test(file),
  );

  for (const file of files) {
    const text = await readFile(file, "utf8");

    for (const match of text.matchAll(relativePathPattern)) {
      addResolvedRuntimeReference(protectedPaths, file, match.groups.target);
    }
  }

  return protectedPaths;
}

function groupedByHash(records) {
  const groups = new Map();

  for (const record of records) {
    const group = groups.get(record.hash) ?? [];
    group.push(record);
    groups.set(record.hash, group);
  }

  return [...groups.values()].filter((group) => group.length > 1);
}

function removableRecords(group, protectedPaths) {
  const sorted = sortRecords(group);
  const hasProtectedRecord = sorted.some(
    (record) => isActivePath(record.path) || protectedPaths.has(record.path),
  );

  if (hasProtectedRecord) {
    return sorted.filter(
      (record) => isLegacyPath(record.path) && !protectedPaths.has(record.path),
    );
  }

  return sorted
    .slice(1)
    .filter(
      (record) => isLegacyPath(record.path) && !protectedPaths.has(record.path),
    );
}

function removalPlan(groups, protectedPaths) {
  return groups
    .map((group) => ({
      group: sortRecords(group),
      remove: removableRecords(group, protectedPaths),
    }))
    .filter(({ remove }) => remove.length > 0)
    .sort((left, right) => right.group[0].size - left.group[0].size);
}

function printPlan(plan) {
  const removableCount = plan.reduce(
    (count, { remove }) => count + remove.length,
    0,
  );

  if (removableCount === 0) {
    console.log("No unused duplicate image files to remove.");
    return;
  }

  console.log(
    `Unused duplicate cleanup would remove ${removableCount} files from ${plan.length} duplicate groups.`,
  );

  for (const { group, remove } of plan) {
    const [{ hash, size }] = group;
    console.log(`\n${size} bytes, sha256 ${hash}`);
    console.log("Keep:");

    for (const record of group.filter(
      (candidate) => !remove.some((removed) => removed.path === candidate.path),
    )) {
      console.log(`- ${record.path}`);
    }

    console.log("Remove:");
    for (const record of remove) {
      console.log(`- ${record.path}`);
    }
  }
}

function gitRemove(files) {
  const batchSize = 50;

  for (let index = 0; index < files.length; index += batchSize) {
    const batch = files.slice(index, index + batchSize);
    const result = spawnSync("git", ["rm", "-f", "--", ...batch], {
      encoding: "utf8",
      stdio: "inherit",
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

const imageFiles = await listExistingFiles(scanDirs, (file) =>
  imageExtensionPattern.test(file),
);
const protectedPaths = await protectedLegacyPaths();
const records = [];

for (const file of imageFiles.sort()) {
  records.push(await imageRecord(file));
}

const plan = removalPlan(groupedByHash(records), protectedPaths);
printPlan(plan);

if (write) {
  const files = plan.flatMap(({ remove }) =>
    remove.map((record) => record.path),
  );

  if (files.length > 0) {
    gitRemove(files);
  }
}
