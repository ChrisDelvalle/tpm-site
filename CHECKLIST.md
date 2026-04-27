# Jekyll To Astro Migration Checklist

## Target Site Structure

- `/` - homepage.
- `/articles/` - complete article archive.
- `/articles/:slug/` - canonical article route.
- `/topics/` - topic index.
- `/topics/:topic/` - filtered topic archive.
- `/about/` - about/static content.
- `/feed.xml` - RSS feed.
- `/404/` - not found page.

Redirect rules are handled outside this repo. The new route shape should stay
compatible with a Cloudflare rule like:

`/:year/:month/:day/:slug/ -> /articles/:slug/`

## Milestone 1: Migration Inventory And Rules

- [x] Count all source Markdown files and classify them as articles, topic index
      pages, static pages, or ignored/generated files.
- [x] Confirm which files are published in production based on existing
      frontmatter such as `published`, `status`, and `date`.
- [x] Record the frontmatter keys currently in use and decide which are required,
      optional, or legacy-only in Astro.
- [x] Confirm all old dated permalink slugs are unique.
- [x] Confirm all generated `/articles/:slug/` routes are unique.
- [x] Define slug derivation order:
      old dated `permalink` slug first, date-stripped filename second, explicit
      future `slug` field third only if intentionally added.
- [x] Document the content source strategy:
      keep legacy Markdown in `docs/` during the initial migration and avoid
      moving article bodies until Astro rendering is stable.
- [x] Identify content compatibility cases that Astro will not process by
      default, especially `{{ site.baseurl }}` and Kramdown attribute syntax.
- [x] Document the internal link policy:
      new generated links use `/articles/:slug/`, while old dated links in
      legacy content may remain if they are intentionally covered by external
      redirects.
- [x] Decide which legacy Jekyll files are source content and which are build
      implementation details.

- [x] There is a reproducible inventory of source content, route slugs, and
      known compatibility issues.
- [x] The migration rules are specific enough that route generation can be
      implemented without guessing.
- [x] No source article body changes are required by the migration plan.

## Milestone 2: Astro Project Foundation

- [x] Install Astro and required build dependencies.
- [x] Add `astro.config.mjs` with `site`, static output, and trailing slash
      behavior configured.
- [x] Add `src/` with initial `pages`, `components`, `layouts`, and `lib`
      directories.
- [x] Add `public/` for static files copied directly into the build output.
- [x] Replace Jekyll-oriented package scripts with Bun/Astro scripts:
      `dev`, `build`, `preview`, and `check`.
- [x] Add TypeScript configuration if Astro does not create one automatically.
- [x] Keep the initial Astro app minimal; no theme porting in this milestone.
- [x] Ensure the repo can run without Ruby or Bundler for the Astro build path.

- [x] `bun run build` succeeds with a minimal Astro page.
- [x] `bun run dev` starts an Astro dev server.
- [x] The Astro project structure is present and committed to the intended
      source directories.

## Milestone 3: Static Assets

- [x] Copy `assets/` into `public/assets/` without renaming files.
- [x] Copy `uploads/` into `public/uploads/` without renaming files.
- [x] Copy `favicon.ico` into `public/favicon.ico`.
- [x] Copy `CNAME` into `public/CNAME` if the deploy target still needs
      it in the static output.
- [x] Keep original root-level asset directories and files in place until the
      Astro build is verified and Jekyll cleanup begins.
- [x] Verify image paths with spaces and URL-encoded spaces still resolve.
- [x] Verify GIFs, SVGs, PNGs, JPGs, and ICO files survive the build unchanged.
- [x] Decide whether generated legacy files such as old `feed.xml` should be
      removed or replaced by Astro endpoints.

- [x] Built output contains `/assets/...`, `/uploads/...`, `/favicon.ico`, and
      any required domain files.
- [x] Existing content image references can resolve without editing article
      bodies.
- [x] No static asset has been renamed as part of the migration.
- [x] No original static asset source has been deleted before Milestone 12.

## Milestone 4: Content Collection Setup

- [x] Configure an Astro content collection for the existing Markdown files.
- [x] Add `src/content.config.ts` and define the collection with
      `defineCollection()`.
- [x] Use Astro's build-time `glob()` loader for local Markdown, with a base
      path that points at `docs/` or at a generated mirror of `docs/`.
- [x] Load content from the current `docs/` source tree or a generated mirror
      without manually changing article bodies.
- [x] Support both `.md` and `.markdown` extensions.
- [x] Start with a permissive schema that accepts current frontmatter:
      `title`, `date`, `author`, `parent`, `grand_parent`, `nav_order`,
      `permalink`, `excerpt`, `image`, `tags`, `categories`, `published`,
      `status`, `type`, `banner`, `fbpreview`, `meta`, and legacy fields.
- [x] Avoid making legacy-only frontmatter fields required unless rendering or
      routing depends on them.
- [x] Normalize frontmatter types in code where needed, such as numeric
      `parent` values or missing author data.
- [x] Filter unpublished content from production builds.
- [x] Keep raw Markdown body content unchanged on disk.
- [x] Keep Markdown body content available for `render(entry)`.
- [x] Add helper functions for article detection, topic detection, sorting, and
      metadata normalization.
- [x] Add centralized route helpers in `src/lib/routes.ts` for article slug
      extraction, article URLs, topic URLs, and trailing-slash normalization.
- [x] Ensure article slug extraction uses old dated `permalink` slugs before
      falling back to date-stripped filenames.
- [x] Do not rely on Astro's default collection `id` as the canonical article
      slug unless `generateId` explicitly implements the migration slug rules.
- [x] Add a duplicate article route assertion that can fail the build before any
      pages, RSS, or sitemap output are generated.

- [x] Astro can query every intended content file.
- [x] Production filtering is deterministic.
- [x] No article body has been edited to satisfy Astro parsing.
- [x] Metadata helpers return stable article, topic, author, date, and image
      values.
- [x] Legacy frontmatter that is not used by Astro does not block the build.
- [x] Route helpers are the only place that define canonical article and topic
      URL formats.
- [x] Duplicate article slugs fail deterministically.

## Milestone 5: Article Routing

- [x] Add `/articles/[...slug].astro`.
- [x] Generate static paths from the content collection with `getStaticPaths()`.
- [x] Ensure every `getStaticPaths()` route param is a string or `undefined`.
- [x] Use the centralized route helpers for every generated article path.
- [x] Pass the collection entry through `getStaticPaths()` props.
- [x] Render article bodies with `render(entry)` from `astro:content`.
- [x] Ensure `/articles/gamergate-as-metagaming/` builds from the existing
      `2021/05/16/gamergate-as-metagaming/` permalink.
- [x] Add an article archive page at `/articles/`.
- [x] Sort article archive entries newest first.
- [x] Include title, date, author, excerpt, and topic in archive entries when
      available.

- [x] Every published dated article has a canonical `/articles/:slug/` page.
- [x] Article slugs are compatible with the planned Cloudflare redirect capture.
- [x] `/articles/` lists all published articles in a predictable order.

## Milestone 6: Base Layout And Theme Approximation

- [x] Create `BaseLayout.astro` with document shell, metadata slots, site header,
      main content area, and footer.
- [x] Create `ArticleLayout.astro` for article title, author, date, excerpt, and
      body rendering.
- [x] Implement a responsive sidebar or top/sidebar hybrid navigation inspired by
      the current Just the Docs layout.
- [x] Use a simple dark theme close to the current site, without requiring pixel
      parity.
- [x] Add readable article typography for long essays, blockquotes, tables,
      images, and code blocks.
- [x] Add mobile navigation behavior.
- [x] Add accessible skip link, landmark regions, and sensible focus states.
- [x] Keep layout code independent of Jekyll/Liquid concepts.

- [x] Homepage, article pages, archive pages, and topic pages share a coherent
      Astro layout.
- [x] The site is readable on mobile and desktop.
- [x] Minor aesthetic differences from the old theme are accepted.
- [x] No `_layouts` or `_includes` code is required for the Astro render path.

## Milestone 7: Homepage And Static Pages

- [x] Rebuild the homepage at `/` in Astro.
- [x] Preserve homepage content and imagery as closely as practical.
- [x] Replace Kramdown-only button/class syntax with Astro markup or a render
      compatibility transform.
- [x] Create `/about/` from the current about/notes content if it remains part of
      the public site.
- [x] Decide whether legacy section landing pages become generated topic pages,
      static pages, or redirects handled outside the repo.
- [x] Add a custom 404 page.

- [x] `/` renders with the intended hero/header image, introductory copy, and
      key links.
- [x] Static pages selected for migration are available at their new routes.
- [x] Legacy section pages have an explicit migration decision.
- [x] `/404/` builds and is usable by the deploy target.

## Milestone 8: Topics And Navigation

- [x] Define canonical topic slugs:
      `meme-culture`, `metamemetics`, `aesthetics`, `irony`,
      `game-studies`, `history`, `philosophy`, and `politics`.
- [x] Map source folders and frontmatter parents to canonical topic slugs.
- [x] Add `/topics/` with all public topics.
- [x] Add `/topics/:topic/` pages with filtered article lists.
- [x] Sort each topic page newest first.
- [x] Show topic navigation in the sidebar or primary navigation.
- [x] Add breadcrumbs or lightweight contextual links from articles back to their
      topic pages.
- [x] Ensure topic labels are display names, not raw folder names.

- [x] Every published article appears in the appropriate topic listing.
- [x] Topic URLs are stable and human-readable.
- [x] Navigation exposes home, articles, topics, and about/static pages.
- [x] Raw legacy folder names such as `game studies` and `memeculture` do not
      leak into public URLs.

## Milestone 9: Markdown Compatibility Layer

- [x] Add a Markdown/render transform for `{{ site.baseurl }}` so output paths
      resolve without editing article bodies.
- [x] Ensure raw HTML in Markdown is preserved where Astro permits it.
- [x] Confirm Astro's default GitHub-Flavored Markdown support covers existing
      tables and common Markdown syntax.
- [x] Rely on Astro's default generated heading IDs unless a compatibility issue
      requires a custom rehype plugin.
- [x] Add visible heading anchor links only if the approximate theme calls for
      them.
- [x] Add table styling or wrappers so wide tables remain usable on mobile.
- [x] Handle old image markup, inline styles, and WordPress-era classes without
      breaking layout.
- [x] Ensure internal Markdown links are either valid new routes or intentionally
      left for external redirect handling.
- [x] Add an allowlist or classifier for old dated internal links so verification
      does not confuse Cloudflare-managed redirects with broken links.
- [x] Ensure no literal Liquid tags appear in built HTML.
- [x] Add a compatibility test or build check for known problematic patterns.

- [x] Built article HTML contains no visible `{{ site.baseurl }}` artifacts.
- [x] Known raw HTML-heavy articles render without fatal build errors.
- [x] Headings, tables, images, blockquotes, and links are usable in rendered
      pages.
- [x] Content files remain unchanged unless a specific manual exception is
      approved.
- [x] Link compatibility checks report intentionally external-redirected links
      separately from true broken links.

## Milestone 10: Search

- [x] Choose the search implementation, preferably Pagefind for a static Astro
      site unless Lunr compatibility is required.
- [x] Add search indexing to the build or postbuild process.
- [x] Add a search UI in the site header or sidebar.
- [x] Ensure search indexes article titles, excerpts, topics, and body content.
- [x] Exclude unpublished or intentionally hidden content.
- [x] Verify search works from a static preview build, not only in dev mode.
- [x] Remove the old Jekyll generated search data path from the active build.

- [x] Search returns relevant results for known article titles and body phrases.
- [x] Search works after `bun run build` and `bun run preview`.
- [x] Hidden or unpublished content is not searchable in production output.
- [x] Legacy `assets/js/zzzz-search-data.json` is no longer part of the active
      search pipeline.

## Milestone 11: SEO, RSS, And Sitemap

- [x] Add title and description metadata from normalized frontmatter.
- [x] Add canonical URLs using the new `/articles/:slug/` structure.
- [x] Add Open Graph and Twitter metadata using `excerpt` and `image` when
      available.
- [x] Add `src/pages/feed.xml.ts` using `@astrojs/rss` and generate
      `/feed.xml`.
- [x] Use centralized route helpers for RSS item URLs.
- [x] Add RSS autodiscovery metadata to the shared page head.
- [x] Add `@astrojs/sitemap`.
- [x] Ensure the Astro config `site` value is set to the production origin.
- [x] Include only published articles in RSS and sitemap output.
- [x] Decide whether to add `robots.txt`.

- [x] Article pages have correct document titles and social metadata.
- [x] `/feed.xml` builds and includes the expected article items.
- [x] Sitemap output builds successfully from static routes.
- [x] RSS and sitemap use new canonical URLs, not old dated URLs.

## Milestone 12: Jekyll Removal And Repo Cleanup

- [x] Remove or archive Jekyll-only implementation files after Astro reaches
      feature parity for the chosen scope.
- [x] Remove `Gemfile`, `Rakefile`, `just-the-docs.gemspec`, `bin/`, `lib/`, and
      Docker Jekyll files if no longer needed.
- [x] Remove `_layouts`, `_includes`, and `_sass` from the active build path.
- [x] Remove generated legacy files such as old `feed.xml` when Astro replaces
      them.
- [x] Update `.gitignore` for Astro output and tooling.
- [x] Update README with Astro development, build, and deployment commands.
- [x] Remove or replace Jekyll/Gem GitHub Actions workflows.
- [x] Keep source content, static assets, and domain files intact.

- [x] The repo no longer requires Ruby, Bundler, Jekyll, or Just the Docs for the
      production build.
- [x] Documentation describes the Astro workflow accurately.
- [x] CI no longer runs Jekyll jobs.
- [x] Cleanup does not delete source content or required static assets.

## Milestone 13: Verification

- [x] Run `bun run build`.
- [x] Run `bun run preview` and smoke-test the generated site.
- [x] Verify all expected article routes return 200.
- [x] Verify `/articles/`, `/topics/`, every `/topics/:topic/`, `/about/`, `/`,
      `/feed.xml`, and `/404/`.
- [x] Run an internal link check against the built site.
- [x] Configure link checking so old dated internal URLs are either checked
      through the deployed redirect layer or reported as expected redirect
      candidates, not as migration failures.
- [x] Check that image requests under `/assets/` and `/uploads/` resolve.
- [x] Check representative articles with raw HTML-heavy content.
- [x] Check representative articles whose old permalink slug differs from the
      filename slug.
- [x] Check mobile layout for navigation and article readability.
- [x] Check that production output contains no Jekyll Liquid artifacts.

- [x] Build passes locally.
- [x] Static preview passes route, link, asset, and visual smoke checks.
- [x] Known edge-case articles render correctly.
- [x] The generated route list matches the intended new site structure.

## Milestone 14: Deployment

This milestone is intentionally left for the production hosting environment.
Repo-side deployment documentation is in `README.md`; the remaining work depends
on the chosen host and Cloudflare configuration.

- [ ] Configure the chosen host to run the Astro build command.
- [ ] Configure the chosen host to publish Astro's `dist/` output.
- [ ] Ensure environment-specific site URL settings are correct.
- [ ] Ensure Cloudflare owns old dated URL redirects outside this repo.
- [ ] Deploy a preview build.
- [ ] Verify production preview routes, assets, RSS, sitemap, and 404 behavior.
- [ ] Cut over production only after redirects and canonical URLs are confirmed.

- [ ] The deployed site is generated by Astro.
- [ ] The deployed output serves the new `/articles/:slug/` structure.
- [ ] External redirect handling is confirmed separately from the repo.
- [ ] Production smoke checks pass after cutover.
