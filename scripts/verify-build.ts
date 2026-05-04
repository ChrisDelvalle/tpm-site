import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

const requiredBasePaths = [
  "index.html",
  "404.html",
  "about/index.html",
  "articles/index.html",
  "articles/all/index.html",
  "categories/index.html",
  "feed.xml",
  "sitemap-index.xml",
  "pagefind/pagefind.js",
];
const staticReadingBasePages = [
  "index.html",
  "about/index.html",
  "articles/index.html",
  "articles/all/index.html",
];
const allowedStaticClientScriptPatterns = [
  /^\/_astro\/AnchoredRoot\.astro_astro_type_script_index_0_lang\.[\w-]+\.js$/u,
] as const;
const astroPrefetchPageScriptPattern = /^\/_astro\/page\.[\w-]+\.js$/u;
const astroPrefetchChunkImportPattern =
  /from\s*["']\.\/(_astro_prefetch\.[\w-]+\.js)["']/u;

/** Source-content publication state used to verify generated output. */
export interface ArticlePublication {
  draftSlugs: string[];
  publishedArticles: PublishedArticle[];
  publishedCategorySlugs: Set<string>;
}

/** Categorized build verification failures. */
export interface BuildVerificationIssues {
  articleCountIssues: string[];
  brokenLinks: string[];
  catalogLeaks: string[];
  draftLeaks: string[];
  invalidLegacyRedirects: string[];
  missingArticleJsonLd: string[];
  missingLegacyRedirects: string[];
  missingRequired: string[];
  sourceMaps: string[];
  unexpectedClientScripts: string[];
  unexpectedDatedPages: string[];
  unexpectedHydrationBoundaries: string[];
}

/** Inputs needed to verify a completed Astro build. */
export interface BuildVerificationOptions {
  articleDir: string;
  categoryDir: string;
  distDir: string;
  expectedRedirects?: Record<string, string>;
}

/** Build verification output used by reports and tests. */
export interface BuildVerificationResult {
  articlePageCount: number;
  astroClientScriptCount: number;
  issues: BuildVerificationIssues;
}

/** Publication metadata for one non-draft article source file. */
export interface PublishedArticle {
  isMdx: boolean;
  slug: string;
}

/**
 * Reads article source files and separates draft and published article data.
 *
 * @param articleDir Source article directory.
 * @returns Publication stats derived from article frontmatter and paths.
 */
export async function articlePublicationStats(
  articleDir: string,
): Promise<ArticlePublication> {
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

/**
 * Formats build verification issues for CI and local command output.
 *
 * @param result Build verification result.
 * @returns Human-readable build verification report.
 */
export function formatBuildVerificationReport(
  result: BuildVerificationResult,
): string {
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
  if (result.issues.catalogLeaks.length > 0) {
    lines.push(
      `Unexpected component catalog output: ${JSON.stringify(result.issues.catalogLeaks)}`,
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
  if (result.issues.sourceMaps.length > 0) {
    lines.push(
      `Unexpected source maps: ${JSON.stringify(result.issues.sourceMaps.slice(0, 50))}`,
    );
  }
  if (result.issues.unexpectedHydrationBoundaries.length > 0) {
    lines.push(
      `Unexpected hydration boundaries: ${JSON.stringify(result.issues.unexpectedHydrationBoundaries.slice(0, 50))}`,
    );
  }

  return lines.join("\n");
}

/**
 * Checks whether a URL points outside the generated static site.
 *
 * @param url URL or URL-like target from rendered HTML.
 * @returns True for protocol-relative, absolute, mail, or telephone URLs.
 */
export function isExternal(url: string): boolean {
  // eslint-disable-next-line security/detect-unsafe-regex -- URL scheme detection is bounded to the target string.
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:mailto|tel):/i.test(url);
}

/**
 * Extracts link and asset targets from rendered HTML attributes.
 *
 * @param html Rendered HTML text.
 * @returns Values from `href` and `src` attributes.
 */
export function linkTargets(html: string): string[] {
  const targets: string[] = [];
  const attributePattern = /\s(?:href|src)=["']([^"']+)["']/gi;
  let match: null | RegExpExecArray;

  while ((match = attributePattern.exec(html)) !== null) {
    const target = match[1];
    if (target !== undefined) {
      targets.push(target);
    }
  }

  return targets;
}

/**
 * Builds the list of required build-output paths for the current source tree.
 *
 * @param articlePublication Published article and draft metadata.
 * @param categorySlugs Category slugs expected in the output.
 * @returns Relative `dist` paths that must exist after build.
 */
export function requiredPathsForSource(
  articlePublication: ArticlePublication,
  categorySlugs: string[],
): string[] {
  return [
    ...requiredBasePaths,
    ...articlePublication.publishedArticles.map(
      (article) => `articles/${article.slug}/index.html`,
    ),
    ...categorySlugs.map((slug) => `categories/${slug}/index.html`),
  ];
}

/**
 * Runs the build verification command-line workflow.
 *
 * @param args Command-line arguments without the executable prefix.
 * @param rootDir Repository root to verify from.
 * @returns Process exit code.
 */
export async function runBuildVerificationCli(
  args = process.argv.slice(2),
  rootDir = process.cwd(),
): Promise<number> {
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

/**
 * Collects all category slugs that should have generated category pages.
 *
 * @param categoryDir Source category metadata directory.
 * @param articlePublication Published article and draft metadata.
 * @returns Sorted category slugs from metadata and published article folders.
 */
export async function sourceCategorySlugs(
  categoryDir: string,
  articlePublication: ArticlePublication,
): Promise<string[]> {
  const slugs = new Set([
    ...(await categorySlugsFromMetadata(categoryDir)),
    ...articlePublication.publishedCategorySlugs,
  ]);

  return Array.from(slugs).sort((left, right) => left.localeCompare(right));
}

/**
 * Chooses representative reading pages that should stay static and lightweight.
 *
 * @param articlePublication Published article and draft metadata.
 * @param categorySlugs Category slugs expected in the output.
 * @returns Relative `dist` paths to inspect for unexpected client scripts.
 */
export function staticReadingPagesForSource(
  articlePublication: ArticlePublication,
  categorySlugs: string[],
): string[] {
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

/**
 * Verifies that generated `dist` output matches source content expectations.
 *
 * @param options Build output, source content, and redirect expectations.
 * @param options.articleDir Source article directory.
 * @param options.categoryDir Source category metadata directory.
 * @param options.distDir Generated build output directory.
 * @param options.expectedRedirects Legacy redirect map from Astro config.
 * @returns Build verification result with counts and issues.
 */
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
  issues.sourceMaps.push(
    ...files
      .map((file) => toPosix(path.relative(distDir, file)))
      .filter((file) => file.endsWith(".map")),
  );

  await collectMissingRequired(distDir, requiredPaths, issues);
  await collectMissingLegacyRedirects(distDir, expectedRedirects, issues);
  if (await exists(distDir, "catalog")) {
    issues.catalogLeaks.push("catalog/");
  }

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

function articlePageFiles(files: string[]): string[] {
  return files.filter((file) =>
    /\/articles\/(?!all\/)[^/]+\/index\.html$/.test(file),
  );
}

function categorySlugFromArticlePath(articleDir: string, file: string): string {
  return path.relative(articleDir, file).split(path.sep)[0] ?? "";
}

async function categorySlugsFromMetadata(
  categoryDir: string,
): Promise<string[]> {
  const categoryFiles = (await listFiles(categoryDir)).filter((file) =>
    /\.json$/i.test(file),
  );

  return categoryFiles.map((file) => path.basename(file, ".json"));
}

async function collectMissingLegacyRedirects(
  distDir: string,
  expectedRedirects: Record<string, string>,
  issues: BuildVerificationIssues,
): Promise<void> {
  for (const [source, destination] of Object.entries(expectedRedirects)) {
    const fallbackPath = redirectFallbackPath(source);
    if (!(await exists(distDir, fallbackPath))) {
      issues.missingLegacyRedirects.push(
        `${source} -> ${destination} (${fallbackPath})`,
      );
    }
  }
}

async function collectMissingRequired(
  distDir: string,
  requiredPaths: string[],
  issues: BuildVerificationIssues,
): Promise<void> {
  for (const requiredPath of requiredPaths) {
    if (!(await exists(distDir, requiredPath))) {
      issues.missingRequired.push(requiredPath);
    }
  }
}

async function configuredRedirects(
  rootDir: string,
): Promise<Record<string, string>> {
  // Coverage note: this dynamic import is the boundary to Astro's user config.
  // Build-verifier behavior is tested with injected redirect maps; this guard
  // remains defensive for malformed local config modules.
  // eslint-disable-next-line no-unsanitized/method -- Fixed local config path, not user-controlled input.
  const configModule: unknown = await import(
    pathToFileURL(path.resolve(rootDir, "astro.config.ts")).href
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

function emptyIssues(): BuildVerificationIssues {
  return {
    articleCountIssues: [],
    brokenLinks: [],
    catalogLeaks: [],
    draftLeaks: [],
    invalidLegacyRedirects: [],
    missingArticleJsonLd: [],
    missingLegacyRedirects: [],
    missingRequired: [],
    sourceMaps: [],
    unexpectedHydrationBoundaries: [],
    unexpectedClientScripts: [],
    unexpectedDatedPages: [],
  };
}

async function exists(distDir: string, relativePath: string): Promise<boolean> {
  try {
    await access(path.join(distDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

function expectedRedirectSource(relativeHtmlPath: string): string {
  return `/${relativeHtmlPath.replace(/index\.html$/, "")}`;
}

function filenameStem(file: string): string {
  return path.basename(file).replace(/\.(?:md|mdx)$/i, "");
}

function hasIssues(issues: BuildVerificationIssues): boolean {
  return (
    issues.articleCountIssues.length > 0 ||
    issues.brokenLinks.length > 0 ||
    issues.catalogLeaks.length > 0 ||
    issues.draftLeaks.length > 0 ||
    issues.invalidLegacyRedirects.length > 0 ||
    issues.missingArticleJsonLd.length > 0 ||
    issues.missingLegacyRedirects.length > 0 ||
    issues.missingRequired.length > 0 ||
    issues.sourceMaps.length > 0 ||
    issues.unexpectedHydrationBoundaries.length > 0 ||
    issues.unexpectedClientScripts.length > 0 ||
    issues.unexpectedDatedPages.length > 0
  );
}

function htmlIncludesRedirect(
  html: string,
  source: string,
  destination: string,
): boolean {
  return (
    html.includes(`<title>Redirecting to: ${destination}</title>`) &&
    html.includes(`content="0;url=${destination}"`) &&
    html.includes(`href="${destination}"`) &&
    html.includes(`<code>${source}</code>`) &&
    html.includes(`<code>${destination}</code>`)
  );
}

async function inspectDraftLeaks(
  distDir: string,
  file: string,
  draftSlugs: string[],
  issues: BuildVerificationIssues,
): Promise<void> {
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

async function inspectHtmlFile(
  distDir: string,
  file: string,
  staticReadingPages: string[],
  expectedRedirects: Record<string, string>,
  issues: BuildVerificationIssues,
): Promise<void> {
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
    const expectedDestination = new Map(Object.entries(expectedRedirects)).get(
      source,
    );

    if (expectedDestination === undefined) {
      issues.invalidLegacyRedirects.push(
        `${relativeHtmlPath}: no matching redirect in astro.config.ts for ${source}`,
      );
    } else if (!htmlIncludesRedirect(text, source, expectedDestination)) {
      issues.invalidLegacyRedirects.push(
        `${relativeHtmlPath}: does not match configured redirect ${source} -> ${expectedDestination}`,
      );
    }

    return;
  }

  if (
    /^articles\/(?!all\/)[^/]+\/index\.html$/.test(relativeHtmlPath) &&
    !text.includes('"@type":"BlogPosting"')
  ) {
    issues.missingArticleJsonLd.push(relativeHtmlPath);
  }

  await inspectStaticReadingPageHtml(
    text,
    relativeHtmlPath,
    staticReadingPages,
    distDir,
    issues,
  );

  for (const target of linkTargets(text)) {
    if (!isExternal(target) && !(await internalTargetExists(distDir, target))) {
      issues.brokenLinks.push(`${relativeHtmlPath} -> ${target}`);
    }
  }
}

async function inspectStaticReadingPageHtml(
  text: string,
  relativeHtmlPath: string,
  staticReadingPages: string[],
  distDir: string,
  issues: BuildVerificationIssues,
): Promise<void> {
  if (!staticReadingPages.includes(relativeHtmlPath)) {
    return;
  }

  const unexpectedScriptSources: string[] = [];

  for (const source of scriptSources(text)) {
    if (
      /^\/_astro\/[^"']+\.js$/iu.test(source) &&
      !(await isAllowedStaticClientScript(distDir, source))
    ) {
      unexpectedScriptSources.push(source);
    }
  }

  if (unexpectedScriptSources.length > 0) {
    issues.unexpectedClientScripts.push(
      `${relativeHtmlPath} -> ${unexpectedScriptSources.join(", ")}`,
    );
  }

  if (/<astro-island\b/i.test(text)) {
    issues.unexpectedHydrationBoundaries.push(relativeHtmlPath);
  }
}

async function isAllowedStaticClientScript(
  distDir: string,
  source: string,
): Promise<boolean> {
  if (
    allowedStaticClientScriptPatterns.some((pattern) => pattern.test(source))
  ) {
    return true;
  }

  if (!astroPrefetchPageScriptPattern.test(source)) {
    return false;
  }

  const scriptText = await staticClientScriptText(distDir, source);
  if (isAstroPrefetchRuntime(scriptText)) {
    return true;
  }

  const prefetchChunk = astroPrefetchChunkImport(scriptText);
  if (prefetchChunk === null) {
    return false;
  }

  return isAstroPrefetchRuntime(
    await staticClientScriptText(distDir, `/_astro/${prefetchChunk}`),
  );
}

function isAstroPrefetchRuntime(scriptText: string): boolean {
  return (
    scriptText.includes("dataset.astroPrefetch") &&
    scriptText.includes("ignoreSlowConnection") &&
    scriptText.includes('relList?.supports?.("prefetch")') &&
    scriptText.includes("navigator.connection")
  );
}

function astroPrefetchChunkImport(scriptText: string): null | string {
  const match = astroPrefetchChunkImportPattern.exec(scriptText);
  const prefetchChunk = match?.[1];

  return prefetchChunk ?? null;
}

async function staticClientScriptText(
  distDir: string,
  source: string,
): Promise<string> {
  try {
    return await readFile(
      path.join(distDir, source.replace(/^\//u, "")),
      "utf8",
    );
  } catch {
    return "";
  }
}

function scriptSources(html: string): string[] {
  const sources: string[] = [];
  const scriptSourcePattern = /<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/giu;
  let match: null | RegExpExecArray;

  while ((match = scriptSourcePattern.exec(html)) !== null) {
    const source = match[1];
    if (source !== undefined) {
      sources.push(source);
    }
  }

  return sources;
}

async function internalTargetExists(
  distDir: string,
  url: string,
): Promise<boolean> {
  const cleanUrl = withoutFragmentAndQuery(url);
  if (cleanUrl === "" || cleanUrl.startsWith("#")) {
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

function isAstroConfigModule(
  value: unknown,
): value is { default: { redirects?: Record<string, unknown> } } {
  // Coverage note: malformed Astro config module shapes are defensive checks
  // around dynamic import output, not normal verifier domain behavior.
  if (!isRecord(value) || !isRecord(value["default"])) {
    return false;
  }

  const redirects = value["default"]["redirects"];
  return redirects === undefined || isRecord(redirects);
}

function isAstroRedirectFallbackPage(
  html: string,
  relativeHtmlPath: string,
): boolean {
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

function isDatedHtmlPage(relativeHtmlPath: string): boolean {
  return /^\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.html$/.test(relativeHtmlPath);
}

function isDraft(data: Record<string, unknown>): boolean {
  return data["draft"] === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = (await readdir(dir, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
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

function redirectFallbackPath(source: string): string {
  return `${source.replace(/^\//, "")}index.html`;
}

function toPosix(file: string): string {
  return file.split(path.sep).join("/");
}

function withoutFragmentAndQuery(url: string): string {
  return url.split("#")[0]?.split("?")[0] ?? "";
}

// Coverage note: this wrapper only wires the exported CLI workflow to process
// exit state; tests exercise `runBuildVerificationCli()` directly.
if (import.meta.main) {
  try {
    process.exitCode = await runBuildVerificationCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
