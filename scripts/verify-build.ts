import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

const requiredBasePaths = [
  "index.html",
  "404.html",
  "about/index.html",
  "articles/index.html",
  "categories/index.html",
  "feed.xml",
  "sitemap-index.xml",
  "pagefind/pagefind.js",
];
const staticReadingBasePages = [
  "index.html",
  "about/index.html",
  "articles/index.html",
];

export interface PublishedArticle {
  isMdx: boolean;
  slug: string;
}

export interface ArticlePublication {
  draftSlugs: string[];
  publishedArticles: PublishedArticle[];
  publishedCategorySlugs: Set<string>;
}

export interface BuildVerificationOptions {
  articleDir: string;
  categoryDir: string;
  distDir: string;
  expectedRedirects?: Record<string, string>;
}

export interface BuildVerificationIssues {
  articleCountIssues: string[];
  brokenLinks: string[];
  draftLeaks: string[];
  invalidLegacyRedirects: string[];
  missingArticleJsonLd: string[];
  missingLegacyRedirects: string[];
  missingRequired: string[];
  unexpectedClientScripts: string[];
  unexpectedDatedPages: string[];
}

export interface BuildVerificationResult {
  articlePageCount: number;
  astroClientScriptCount: number;
  issues: BuildVerificationIssues;
}

async function exists(distDir: string, relativePath: string) {
  try {
    await access(path.join(distDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

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

function toPosix(file: string) {
  return file.split(path.sep).join("/");
}

function filenameStem(file: string) {
  return path.basename(file).replace(/\.(?:md|mdx)$/i, "");
}

function categorySlugFromArticlePath(articleDir: string, file: string) {
  return path.relative(articleDir, file).split(path.sep)[0] ?? "";
}

function isDraft(data: Record<string, unknown>) {
  return data["draft"] === true;
}

export async function articlePublicationStats(articleDir: string) {
  const articleSourceFiles = (await listFiles(articleDir)).filter((file) =>
    /\.mdx?$/i.test(file),
  );
  const draftSlugs: string[] = [];
  const publishedArticles: PublishedArticle[] = [];
  const publishedCategorySlugs = new Set<string>();

  for (const file of articleSourceFiles) {
    const { data } = matter(await readFile(file, "utf8"));
    if (isDraft(data)) {
      draftSlugs.push(filenameStem(file));
    } else {
      const slug = filenameStem(file);
      publishedArticles.push({
        isMdx: /\.mdx$/i.test(file),
        slug,
      });

      const categorySlug = categorySlugFromArticlePath(articleDir, file);
      if (categorySlug !== "") {
        publishedCategorySlugs.add(categorySlug);
      }
    }
  }

  return {
    draftSlugs: draftSlugs.sort((left, right) => left.localeCompare(right)),
    publishedArticles: publishedArticles.sort((left, right) =>
      left.slug.localeCompare(right.slug),
    ),
    publishedCategorySlugs,
  };
}

async function categorySlugsFromMetadata(categoryDir: string) {
  const categoryFiles = (await listFiles(categoryDir)).filter((file) =>
    /\.json$/i.test(file),
  );

  return categoryFiles.map((file) => path.basename(file, ".json"));
}

export async function sourceCategorySlugs(
  categoryDir: string,
  articlePublication: ArticlePublication,
) {
  const slugs = new Set([
    ...(await categorySlugsFromMetadata(categoryDir)),
    ...articlePublication.publishedCategorySlugs,
  ]);

  return [...slugs].sort((left, right) => left.localeCompare(right));
}

export function requiredPathsForSource(
  articlePublication: ArticlePublication,
  categorySlugs: string[],
) {
  return [
    ...requiredBasePaths,
    ...articlePublication.publishedArticles.map(
      (article) => `articles/${article.slug}/index.html`,
    ),
    ...categorySlugs.map((slug) => `categories/${slug}/index.html`),
  ];
}

export function staticReadingPagesForSource(
  articlePublication: ArticlePublication,
  categorySlugs: string[],
) {
  const representativeMarkdownArticle =
    articlePublication.publishedArticles.find((article) => !article.isMdx);

  return [
    ...staticReadingBasePages,
    representativeMarkdownArticle === undefined
      ? undefined
      : `articles/${representativeMarkdownArticle.slug}/index.html`,
    categorySlugs[0] === undefined
      ? undefined
      : `categories/${categorySlugs[0]}/index.html`,
  ].filter((page): page is string => page !== undefined);
}

export function linkTargets(html: string) {
  const targets: string[] = [];
  const attributePattern = /\s(?:href|src)=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(html)) !== null) {
    const target = match[1];
    if (target !== undefined) {
      targets.push(target);
    }
  }

  return targets;
}

function isDatedHtmlPage(relativeHtmlPath: string) {
  return /^\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.html$/.test(relativeHtmlPath);
}

function expectedRedirectSource(relativeHtmlPath: string) {
  return `/${relativeHtmlPath.replace(/index\.html$/, "")}`;
}

function redirectFallbackPath(source: string) {
  return `${source.replace(/^\//, "")}index.html`;
}

function htmlIncludesRedirect(
  html: string,
  source: string,
  destination: string,
) {
  return (
    html.includes(`<title>Redirecting to: ${destination}</title>`) &&
    html.includes(`content="0;url=${destination}"`) &&
    html.includes(`href="${destination}"`) &&
    html.includes(`<code>${source}</code>`) &&
    html.includes(`<code>${destination}</code>`)
  );
}

function isAstroRedirectFallbackPage(html: string, relativeHtmlPath: string) {
  if (!isDatedHtmlPage(relativeHtmlPath)) {
    return false;
  }

  return (
    /<title>Redirecting to: [^<]+<\/title>/i.test(html) &&
    /<meta\s+http-equiv=["']refresh["']\s+content=["']0;url=[^"']+["']>/i.test(
      html,
    ) &&
    /<meta\s+name=["']robots["']\s+content=["']noindex["']>/i.test(html) &&
    /<link\s+rel=["']canonical["']\s+href=["']https?:\/\/[^"']+["']>/i.test(
      html,
    ) &&
    html.includes(`<code>${expectedRedirectSource(relativeHtmlPath)}</code>`)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAstroConfigModule(
  value: unknown,
): value is { default: { redirects?: Record<string, unknown> } } {
  if (!isRecord(value) || !isRecord(value["default"])) {
    return false;
  }

  const redirects = value["default"]["redirects"];
  return redirects === undefined || isRecord(redirects);
}

async function configuredRedirects(rootDir: string) {
  // eslint-disable-next-line no-unsanitized/method -- Fixed local config path, not user-controlled input.
  const configModule: unknown = await import(
    pathToFileURL(path.resolve(rootDir, "astro.config.mjs")).href
  );

  if (!isAstroConfigModule(configModule)) {
    throw new TypeError("Astro config module has an unexpected shape.");
  }

  const redirects = configModule.default.redirects;
  if (redirects === undefined) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(redirects).map(([source, destination]) => {
      if (typeof destination !== "string") {
        throw new TypeError(
          `Expected string redirect destination for ${source}.`,
        );
      }

      return [source, destination];
    }),
  );
}

export function isExternal(url: string) {
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:mailto|tel):/i.test(url);
}

function withoutFragmentAndQuery(url: string) {
  return url.split("#")[0]?.split("?")[0] ?? "";
}

async function internalTargetExists(distDir: string, url: string) {
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
  ].filter((candidate): candidate is string => candidate !== "");

  for (const candidate of candidates) {
    if (await exists(distDir, candidate)) {
      return true;
    }
  }

  return false;
}

function emptyIssues(): BuildVerificationIssues {
  return {
    articleCountIssues: [],
    brokenLinks: [],
    draftLeaks: [],
    invalidLegacyRedirects: [],
    missingArticleJsonLd: [],
    missingLegacyRedirects: [],
    missingRequired: [],
    unexpectedClientScripts: [],
    unexpectedDatedPages: [],
  };
}

async function collectMissingRequired(
  distDir: string,
  requiredPaths: string[],
  issues: BuildVerificationIssues,
) {
  for (const requiredPath of requiredPaths) {
    if (!(await exists(distDir, requiredPath))) {
      issues.missingRequired.push(requiredPath);
    }
  }
}

async function collectMissingLegacyRedirects(
  distDir: string,
  expectedRedirects: Record<string, string>,
  issues: BuildVerificationIssues,
) {
  for (const [source, destination] of Object.entries(expectedRedirects)) {
    const fallbackPath = redirectFallbackPath(source);
    if (!(await exists(distDir, fallbackPath))) {
      issues.missingLegacyRedirects.push(
        `${source} -> ${destination} (${fallbackPath})`,
      );
    }
  }
}

async function inspectHtmlFile(
  distDir: string,
  file: string,
  staticReadingPages: string[],
  expectedRedirects: Record<string, string>,
  issues: BuildVerificationIssues,
) {
  const text = await readFile(file, "utf8");
  const relativeHtmlPath = toPosix(path.relative(distDir, file));
  const isRedirectFallback = isAstroRedirectFallbackPage(
    text,
    relativeHtmlPath,
  );

  if (isDatedHtmlPage(relativeHtmlPath) && !isRedirectFallback) {
    issues.unexpectedDatedPages.push(relativeHtmlPath);
  }

  if (isRedirectFallback) {
    const source = expectedRedirectSource(relativeHtmlPath);
    const expectedDestination = expectedRedirects[source];

    if (expectedDestination === undefined) {
      issues.invalidLegacyRedirects.push(
        `${relativeHtmlPath}: no matching redirect in astro.config.mjs for ${source}`,
      );
    } else if (!htmlIncludesRedirect(text, source, expectedDestination)) {
      issues.invalidLegacyRedirects.push(
        `${relativeHtmlPath}: does not match configured redirect ${source} -> ${expectedDestination}`,
      );
    }

    return;
  }

  if (
    /^articles\/[^/]+\/index\.html$/.test(relativeHtmlPath) &&
    !text.includes('"@type":"BlogPosting"')
  ) {
    issues.missingArticleJsonLd.push(relativeHtmlPath);
  }

  if (
    staticReadingPages.includes(relativeHtmlPath) &&
    /<script[^>]+src=["']\/_astro\/[^"']+\.js["']/i.test(text)
  ) {
    issues.unexpectedClientScripts.push(relativeHtmlPath);
  }

  for (const target of linkTargets(text)) {
    if (!isExternal(target) && !(await internalTargetExists(distDir, target))) {
      issues.brokenLinks.push(`${relativeHtmlPath} -> ${target}`);
    }
  }
}

async function inspectDraftLeaks(
  distDir: string,
  file: string,
  draftSlugs: string[],
  issues: BuildVerificationIssues,
) {
  const relativePath = toPosix(path.relative(distDir, file));
  if (
    relativePath !== "feed.xml" &&
    !/^sitemap.*\.xml$/.test(relativePath) &&
    !relativePath.startsWith("pagefind/")
  ) {
    return;
  }

  const text = await readFile(file, "utf8");
  for (const draftSlug of draftSlugs) {
    if (text.includes(draftSlug)) {
      issues.draftLeaks.push(`${relativePath} -> ${draftSlug}`);
    }
  }
}

function articlePageFiles(files: string[]) {
  return files.filter((file) => /\/articles\/[^/]+\/index\.html$/.test(file));
}

function hasIssues(issues: BuildVerificationIssues) {
  return (
    issues.articleCountIssues.length > 0 ||
    issues.brokenLinks.length > 0 ||
    issues.draftLeaks.length > 0 ||
    issues.invalidLegacyRedirects.length > 0 ||
    issues.missingArticleJsonLd.length > 0 ||
    issues.missingLegacyRedirects.length > 0 ||
    issues.missingRequired.length > 0 ||
    issues.unexpectedClientScripts.length > 0 ||
    issues.unexpectedDatedPages.length > 0
  );
}

export async function verifyBuild({
  articleDir,
  categoryDir,
  distDir,
  expectedRedirects = {},
}: BuildVerificationOptions): Promise<BuildVerificationResult> {
  const files = await listFiles(distDir);
  const articlePublication = await articlePublicationStats(articleDir);
  const categorySlugs = await sourceCategorySlugs(
    categoryDir,
    articlePublication,
  );
  const requiredPaths = requiredPathsForSource(
    articlePublication,
    categorySlugs,
  );
  const staticReadingPages = staticReadingPagesForSource(
    articlePublication,
    categorySlugs,
  );
  const htmlAndXml = files.filter((file) => /\.(?:html|xml)$/i.test(file));
  const astroClientScripts = files.filter((file) =>
    /\/_astro\/.+\.js$/i.test(file),
  );
  const issues = emptyIssues();

  await collectMissingRequired(distDir, requiredPaths, issues);
  await collectMissingLegacyRedirects(distDir, expectedRedirects, issues);

  for (const file of htmlAndXml) {
    if (file.endsWith(".html")) {
      await inspectHtmlFile(
        distDir,
        file,
        staticReadingPages,
        expectedRedirects,
        issues,
      );
    }

    await inspectDraftLeaks(
      distDir,
      file,
      articlePublication.draftSlugs,
      issues,
    );
  }

  const articleStats = await stat(path.join(distDir, "articles"));
  if (!articleStats.isDirectory()) {
    issues.missingRequired.push("articles/");
  }

  const articlePages = articlePageFiles(files);
  const expectedArticlePages = articlePublication.publishedArticles.length;

  if (articlePages.length !== expectedArticlePages) {
    issues.articleCountIssues.push(
      `expected ${expectedArticlePages} article pages from published source content, found ${articlePages.length}`,
    );
  }

  return {
    articlePageCount: articlePages.length,
    astroClientScriptCount: astroClientScripts.length,
    issues,
  };
}

export function formatBuildVerificationReport(result: BuildVerificationResult) {
  if (!hasIssues(result.issues)) {
    return `Build verification passed: ${result.articlePageCount} articles and ${result.astroClientScriptCount} Astro client script assets.`;
  }

  const lines = ["Build verification failed."];

  if (result.issues.missingRequired.length > 0) {
    lines.push(`Missing: ${JSON.stringify(result.issues.missingRequired)}`);
  }
  if (result.issues.missingLegacyRedirects.length > 0) {
    lines.push(
      `Missing legacy redirects: ${JSON.stringify(result.issues.missingLegacyRedirects.slice(0, 50))}`,
    );
  }
  if (result.issues.invalidLegacyRedirects.length > 0) {
    lines.push(
      `Invalid legacy redirects: ${JSON.stringify(result.issues.invalidLegacyRedirects.slice(0, 50))}`,
    );
  }
  if (result.issues.brokenLinks.length > 0) {
    lines.push(
      `Broken links: ${JSON.stringify(result.issues.brokenLinks.slice(0, 50))}`,
    );
  }
  if (result.issues.articleCountIssues.length > 0) {
    lines.push(
      `Article count mismatch: ${JSON.stringify(result.issues.articleCountIssues)}`,
    );
  }
  if (result.issues.unexpectedClientScripts.length > 0) {
    lines.push(
      `Unexpected static-page client scripts: ${JSON.stringify(result.issues.unexpectedClientScripts)}`,
    );
  }
  if (result.issues.unexpectedDatedPages.length > 0) {
    lines.push(
      `Unexpected generated dated pages: ${JSON.stringify(result.issues.unexpectedDatedPages)}`,
    );
  }
  if (result.issues.draftLeaks.length > 0) {
    lines.push(
      `Draft content leaked into generated metadata: ${JSON.stringify(result.issues.draftLeaks)}`,
    );
  }
  if (result.issues.missingArticleJsonLd.length > 0) {
    lines.push(
      `Missing article JSON-LD: ${JSON.stringify(result.issues.missingArticleJsonLd.slice(0, 50))}`,
    );
  }

  return lines.join("\n");
}

export async function runBuildVerificationCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
) {
  const quiet = args.includes("--quiet");
  const expectedRedirects = await configuredRedirects(rootDir);
  const result = await verifyBuild({
    articleDir: path.resolve(rootDir, "src/content/articles"),
    categoryDir: path.resolve(rootDir, "src/content/categories"),
    distDir: path.resolve(rootDir, "dist"),
    expectedRedirects,
  });
  const report = formatBuildVerificationReport(result);

  if (hasIssues(result.issues)) {
    console.error(report);
    return 1;
  }

  if (!quiet) {
    console.log(report);
  }

  return 0;
}

if (import.meta.main) {
  try {
    process.exitCode = await runBuildVerificationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
