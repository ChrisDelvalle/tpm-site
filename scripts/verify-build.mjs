import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const distDir = path.resolve("dist");
const articleDir = path.resolve("src/content/articles");
const requiredPaths = [
  "index.html",
  "404.html",
  "about/index.html",
  "articles/index.html",
  "articles/gamergate-as-metagaming/index.html",
  "articles/misattributed-plato-quote-is-real-now/index.html",
  "articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/index.html",
  "categories/index.html",
  "categories/aesthetics/index.html",
  "categories/game-studies/index.html",
  "categories/history/index.html",
  "categories/irony/index.html",
  "categories/memeculture/index.html",
  "categories/metamemetics/index.html",
  "categories/philosophy/index.html",
  "categories/politics/index.html",
  "feed.xml",
  "sitemap-index.xml",
  "pagefind/pagefind.js",
];
const staticReadingPages = [
  "index.html",
  "about/index.html",
  "articles/index.html",
  "articles/gamergate-as-metagaming/index.html",
  "categories/history/index.html",
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

function filenameStem(file) {
  return path.basename(file).replace(/\.(?:md|mdx)$/i, "");
}

async function articlePublicationStats() {
  const articleSourceFiles = (await listFiles(articleDir)).filter((file) =>
    /\.mdx?$/i.test(file),
  );
  const draftSlugs = [];
  let publishedCount = 0;

  for (const file of articleSourceFiles) {
    const { data } = matter(await readFile(file, "utf8"));
    if (data.draft === true) {
      draftSlugs.push(filenameStem(file));
    } else {
      publishedCount += 1;
    }
  }

  return { draftSlugs, publishedCount };
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

async function internalTargetExists(url) {
  const cleanUrl = withoutFragmentAndQuery(url);
  if (!cleanUrl || cleanUrl.startsWith("#")) {
    return true;
  }
  if (!cleanUrl.startsWith("/")) {
    return true;
  }

  const decoded = decodeURIComponent(cleanUrl).replace(/^\//, "");
  const candidates = [
    decoded,
    path.join(decoded, "index.html"),
    decoded.endsWith("/") ? path.join(decoded, "index.html") : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return true;
    }
  }

  return false;
}

const missingRequired = [];
for (const requiredPath of requiredPaths) {
  if (!(await exists(requiredPath))) {
    missingRequired.push(requiredPath);
  }
}

const files = await listFiles(distDir);
const articlePublication = await articlePublicationStats();
const htmlAndXml = files.filter((file) => /\.(?:html|xml)$/i.test(file));
const astroClientScripts = files.filter((file) =>
  /\/_astro\/.+\.js$/i.test(file),
);
const brokenLinks = [];
const draftLeaks = [];
const articleCountIssues = [];
const missingArticleJsonLd = [];
const unexpectedClientScripts = [];
const unexpectedDatedPages = [];

for (const file of htmlAndXml) {
  const text = await readFile(file, "utf8");

  if (file.endsWith(".html")) {
    const relativeHtmlPath = path.relative(distDir, file);
    if (
      /^articles\/[^/]+\/index\.html$/.test(relativeHtmlPath) &&
      !text.includes('"@type":"BlogPosting"')
    ) {
      missingArticleJsonLd.push(relativeHtmlPath);
    }

    if (/^\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.html$/.test(relativeHtmlPath)) {
      unexpectedDatedPages.push(relativeHtmlPath);
    }

    if (
      staticReadingPages.includes(relativeHtmlPath) &&
      /<script[^>]+src=["']\/_astro\/[^"']+\.js["']/i.test(text)
    ) {
      unexpectedClientScripts.push(relativeHtmlPath);
    }

    for (const target of linkTargets(text)) {
      if (isExternal(target)) {
        continue;
      }
      if (!(await internalTargetExists(target))) {
        brokenLinks.push(`${path.relative(distDir, file)} -> ${target}`);
      }
    }
  }
}

for (const file of files) {
  const relativePath = path.relative(distDir, file);
  if (
    relativePath === "feed.xml" ||
    /^sitemap.*\.xml$/.test(relativePath) ||
    relativePath.startsWith("pagefind/")
  ) {
    const text = await readFile(file, "utf8");
    for (const draftSlug of articlePublication.draftSlugs) {
      if (text.includes(draftSlug)) {
        draftLeaks.push(`${relativePath} -> ${draftSlug}`);
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
const expectedArticlePages = articlePublication.publishedCount;

if (articlePages.length !== expectedArticlePages) {
  articleCountIssues.push(
    `expected ${expectedArticlePages} article pages from published source content, found ${articlePages.length}`,
  );
}

if (
  missingRequired.length ||
  brokenLinks.length ||
  draftLeaks.length ||
  articleCountIssues.length ||
  missingArticleJsonLd.length ||
  unexpectedClientScripts.length ||
  unexpectedDatedPages.length
) {
  console.error("Build verification failed.");
  if (missingRequired.length) {
    console.error("Missing:", missingRequired);
  }
  if (brokenLinks.length) {
    console.error("Broken links:", brokenLinks.slice(0, 50));
  }
  if (articleCountIssues.length) {
    console.error("Article count mismatch:", articleCountIssues);
  }
  if (unexpectedClientScripts.length) {
    console.error(
      "Unexpected static-page client scripts:",
      unexpectedClientScripts,
    );
  }
  if (unexpectedDatedPages.length) {
    console.error("Unexpected generated dated pages:", unexpectedDatedPages);
  }
  if (draftLeaks.length) {
    console.error("Draft content leaked into generated metadata:", draftLeaks);
  }
  if (missingArticleJsonLd.length) {
    console.error(
      "Missing article JSON-LD:",
      missingArticleJsonLd.slice(0, 50),
    );
  }
  process.exit(1);
}

console.log(
  `Build verification passed: ${articlePages.length} articles and ${astroClientScripts.length} Astro client script assets.`,
);
