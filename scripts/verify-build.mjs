import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const requiredPaths = [
  "index.html",
  "404.html",
  "about/index.html",
  "articles/index.html",
  "articles/gamergate-as-metagaming/index.html",
  "articles/misattributed-plato-quote-is-real-now/index.html",
  "articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/index.html",
  "topics/index.html",
  "topics/aesthetics/index.html",
  "topics/game-studies/index.html",
  "topics/history/index.html",
  "topics/irony/index.html",
  "topics/meme-culture/index.html",
  "topics/metamemetics/index.html",
  "topics/philosophy/index.html",
  "topics/politics/index.html",
  "feed.xml",
  "sitemap-index.xml",
  "pagefind/pagefind.js",
  "assets/images/2022-04-05_tpm-header_trnp_dm.png",
  "uploads/2019-04-05 12_31_47-catgirl meme - Google Search.png",
];

async function exists(relativePath) {
  try {
    await access(path.join(distDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function linkTargets(html) {
  const targets = [];
  const attributePattern = /\s(?:href|src)=["']([^"']+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html))) {
    targets.push(match[1]);
  }

  return targets;
}

function isExternal(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:mailto|tel):/i.test(url);
}

function withoutFragmentAndQuery(url) {
  return url.split("#")[0].split("?")[0];
}

function isOldDatedRoute(url) {
  return /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(url);
}

async function internalTargetExists(url) {
  const cleanUrl = withoutFragmentAndQuery(url);
  if (!cleanUrl || cleanUrl.startsWith("#")) return true;
  if (!cleanUrl.startsWith("/")) return true;
  if (isOldDatedRoute(cleanUrl)) return true;

  const decoded = decodeURIComponent(cleanUrl).replace(/^\//, "");
  const candidates = [
    decoded,
    path.join(decoded, "index.html"),
    decoded.endsWith("/") ? path.join(decoded, "index.html") : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await exists(candidate)) return true;
  }

  return false;
}

const missingRequired = [];
for (const requiredPath of requiredPaths) {
  if (!(await exists(requiredPath))) missingRequired.push(requiredPath);
}

const files = await listFiles(distDir);
const htmlAndXml = files.filter((file) => /\.(html|xml)$/i.test(file));
const liquidFiles = [];
const brokenLinks = [];
let oldDatedLinks = 0;

for (const file of htmlAndXml) {
  const text = await readFile(file, "utf8");
  if (/\{\{\s*site\.baseurl\s*\}\}|\{%/.test(text)) {
    liquidFiles.push(path.relative(distDir, file));
  }

  if (file.endsWith(".html")) {
    for (const target of linkTargets(text)) {
      if (isExternal(target)) continue;
      const cleanTarget = withoutFragmentAndQuery(target);
      if (isOldDatedRoute(cleanTarget)) {
        oldDatedLinks += 1;
        continue;
      }
      if (!(await internalTargetExists(target))) {
        brokenLinks.push(`${path.relative(distDir, file)} -> ${target}`);
      }
    }
  }
}

const articleStats = await stat(path.join(distDir, "articles"));
if (!articleStats.isDirectory()) {
  missingRequired.push("articles/");
}

const articlePages = files.filter((file) =>
  /\/articles\/[^/]+\/index\.html$/.test(file),
);

if (articlePages.length !== 60) {
  brokenLinks.push(`expected 60 article pages, found ${articlePages.length}`);
}

if (missingRequired.length || liquidFiles.length || brokenLinks.length) {
  console.error("Build verification failed.");
  if (missingRequired.length) console.error("Missing:", missingRequired);
  if (liquidFiles.length) console.error("Liquid artifacts:", liquidFiles);
  if (brokenLinks.length) console.error("Broken links:", brokenLinks.slice(0, 50));
  process.exit(1);
}

console.log(
  `Build verification passed: ${articlePages.length} articles, ${oldDatedLinks} old dated links classified as redirect candidates.`,
);
