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

- [ ] Count all source Markdown files and classify them as articles, topic index
      pages, static pages, or ignored/generated files.
- [ ] Confirm which files are published in production based on existing
      frontmatter such as `published`, `status`, and `date`.
- [ ] Record the frontmatter keys currently in use and decide which are required,
      optional, or legacy-only in Astro.
- [ ] Confirm all old dated permalink slugs are unique.
- [ ] Confirm all generated `/articles/:slug/` routes are unique.
- [ ] Define slug derivation order:
      old dated `permalink` slug first, date-stripped filename second, explicit
      future `slug` field third only if intentionally added.
- [ ] Identify content compatibility cases that Astro will not process by
      default, especially `{{ site.baseurl }}` and Kramdown attribute syntax.
- [ ] Decide which legacy Jekyll files are source content and which are build
      implementation details.

- [ ] There is a reproducible inventory of source content, route slugs, and
      known compatibility issues.
- [ ] The migration rules are specific enough that route generation can be
      implemented without guessing.
- [ ] No source article body changes are required by the migration plan.

## Milestone 2: Astro Project Foundation

- [ ] Install Astro and required build dependencies.
- [ ] Add `astro.config.mjs` with `site`, static output, and trailing slash
      behavior configured.
- [ ] Add `src/` with initial `pages`, `components`, `layouts`, and `lib`
      directories.
- [ ] Add `public/` for static files copied directly into the build output.
- [ ] Replace Jekyll-oriented package scripts with Bun/Astro scripts:
      `dev`, `build`, `preview`, and `check`.
- [ ] Add TypeScript configuration if Astro does not create one automatically.
- [ ] Keep the initial Astro app minimal; no theme porting in this milestone.
- [ ] Ensure the repo can run without Ruby or Bundler for the Astro build path.

- [ ] `bun run build` succeeds with a minimal Astro page.
- [ ] `bun run dev` starts an Astro dev server.
- [ ] The Astro project structure is present and committed to the intended
      source directories.

## Milestone 3: Static Assets

- [ ] Move or copy `assets/` into `public/assets/` without renaming files.
- [ ] Move or copy `uploads/` into `public/uploads/` without renaming files.
- [ ] Move or copy `favicon.ico` into `public/favicon.ico`.
- [ ] Move or copy `CNAME` into `public/CNAME` if the deploy target still needs
      it in the static output.
- [ ] Verify image paths with spaces and URL-encoded spaces still resolve.
- [ ] Verify GIFs, SVGs, PNGs, JPGs, and ICO files survive the build unchanged.
- [ ] Decide whether generated legacy files such as old `feed.xml` should be
      removed or replaced by Astro endpoints.

- [ ] Built output contains `/assets/...`, `/uploads/...`, `/favicon.ico`, and
      any required domain files.
- [ ] Existing content image references can resolve without editing article
      bodies.
- [ ] No static asset has been renamed as part of the migration.

## Milestone 4: Content Collection Setup

- [ ] Configure an Astro content collection for the existing Markdown files.
- [ ] Prefer loading content from the current source tree or a direct migrated
      copy without changing article bodies.
- [ ] Support both `.md` and `.markdown` extensions.
- [ ] Create a schema that accepts current frontmatter:
      `title`, `date`, `author`, `parent`, `grand_parent`, `nav_order`,
      `permalink`, `excerpt`, `image`, `tags`, `categories`, `published`,
      `status`, `type`, `banner`, `fbpreview`, `meta`, and legacy fields.
- [ ] Normalize frontmatter types in code where needed, such as numeric
      `parent` values or missing author data.
- [ ] Filter unpublished content from production builds.
- [ ] Keep raw Markdown body content unchanged on disk.
- [ ] Add helper functions for article detection, topic detection, sorting, and
      metadata normalization.

- [ ] Astro can query every intended content file.
- [ ] Production filtering is deterministic.
- [ ] No article body has been edited to satisfy Astro parsing.
- [ ] Metadata helpers return stable article, topic, author, date, and image
      values.

## Milestone 5: Article Routing

- [ ] Add `/articles/[...slug].astro`.
- [ ] Generate static paths from the content collection.
- [ ] Derive each article slug from old dated `permalink` when available.
- [ ] Fall back to the date-stripped filename only when a dated permalink is not
      available.
- [ ] Ensure `/articles/gamergate-as-metagaming/` builds from the existing
      `2021/05/16/gamergate-as-metagaming/` permalink.
- [ ] Add a build-time route collision check that fails on duplicate article
      slugs.
- [ ] Add an article archive page at `/articles/`.
- [ ] Sort article archive entries newest first.
- [ ] Include title, date, author, excerpt, and topic in archive entries when
      available.

- [ ] Every published dated article has a canonical `/articles/:slug/` page.
- [ ] Article slugs are compatible with the planned Cloudflare redirect capture.
- [ ] Duplicate slugs fail the build before deployment.
- [ ] `/articles/` lists all published articles in a predictable order.

## Milestone 6: Base Layout And Theme Approximation

- [ ] Create `BaseLayout.astro` with document shell, metadata slots, site header,
      main content area, and footer.
- [ ] Create `ArticleLayout.astro` for article title, author, date, excerpt, and
      body rendering.
- [ ] Implement a responsive sidebar or top/sidebar hybrid navigation inspired by
      the current Just the Docs layout.
- [ ] Use a simple dark theme close to the current site, without requiring pixel
      parity.
- [ ] Add readable article typography for long essays, blockquotes, tables,
      images, and code blocks.
- [ ] Add mobile navigation behavior.
- [ ] Add accessible skip link, landmark regions, and sensible focus states.
- [ ] Keep layout code independent of Jekyll/Liquid concepts.

- [ ] Homepage, article pages, archive pages, and topic pages share a coherent
      Astro layout.
- [ ] The site is readable on mobile and desktop.
- [ ] Minor aesthetic differences from the old theme are accepted.
- [ ] No `_layouts` or `_includes` code is required for the Astro render path.

## Milestone 7: Homepage And Static Pages

- [ ] Rebuild the homepage at `/` in Astro.
- [ ] Preserve homepage content and imagery as closely as practical.
- [ ] Replace Kramdown-only button/class syntax with Astro markup or a render
      compatibility transform.
- [ ] Create `/about/` from the current about/notes content if it remains part of
      the public site.
- [ ] Decide whether legacy section landing pages become generated topic pages,
      static pages, or redirects handled outside the repo.
- [ ] Add a custom 404 page.

- [ ] `/` renders with the intended hero/header image, introductory copy, and
      key links.
- [ ] Static pages selected for migration are available at their new routes.
- [ ] Legacy section pages have an explicit migration decision.
- [ ] `/404/` builds and is usable by the deploy target.

## Milestone 8: Topics And Navigation

- [ ] Define canonical topic slugs:
      `aesthetics`, `dialogues`, `game-studies`, `history`, `irony`,
      `meme-culture`, `metamemetics`, `philosophy`, and `politics`.
- [ ] Map source folders and frontmatter parents to canonical topic slugs.
- [ ] Add `/topics/` with all public topics.
- [ ] Add `/topics/:topic/` pages with filtered article lists.
- [ ] Sort each topic page newest first.
- [ ] Show topic navigation in the sidebar or primary navigation.
- [ ] Add breadcrumbs or lightweight contextual links from articles back to their
      topic pages.
- [ ] Ensure topic labels are display names, not raw folder names.

- [ ] Every published article appears in the appropriate topic listing.
- [ ] Topic URLs are stable and human-readable.
- [ ] Navigation exposes home, articles, topics, and about/static pages.
- [ ] Raw legacy folder names such as `game studies` and `memeculture` do not
      leak into public URLs.

## Milestone 9: Markdown Compatibility Layer

- [ ] Add a Markdown/render transform for `{{ site.baseurl }}` so output paths
      resolve without editing article bodies.
- [ ] Ensure raw HTML in Markdown is preserved where Astro permits it.
- [ ] Add heading IDs and anchor links.
- [ ] Add table styling or wrappers so wide tables remain usable on mobile.
- [ ] Handle old image markup, inline styles, and WordPress-era classes without
      breaking layout.
- [ ] Ensure internal Markdown links are either valid new routes or intentionally
      left for external redirect handling.
- [ ] Ensure no literal Liquid tags appear in built HTML.
- [ ] Add a compatibility test or build check for known problematic patterns.

- [ ] Built article HTML contains no visible `{{ site.baseurl }}` artifacts.
- [ ] Known raw HTML-heavy articles render without fatal build errors.
- [ ] Headings, tables, images, blockquotes, and links are usable in rendered
      pages.
- [ ] Content files remain unchanged unless a specific manual exception is
      approved.

## Milestone 10: Search

- [ ] Choose the search implementation, preferably Pagefind for a static Astro
      site unless Lunr compatibility is required.
- [ ] Add search indexing to the build or postbuild process.
- [ ] Add a search UI in the site header or sidebar.
- [ ] Ensure search indexes article titles, excerpts, topics, and body content.
- [ ] Exclude unpublished or intentionally hidden content.
- [ ] Verify search works from a static preview build, not only in dev mode.
- [ ] Remove the old Jekyll generated search data path from the active build.

- [ ] Search returns relevant results for known article titles and body phrases.
- [ ] Search works after `bun run build` and `bun run preview`.
- [ ] Hidden or unpublished content is not searchable in production output.
- [ ] Legacy `assets/js/zzzz-search-data.json` is no longer part of the active
      search pipeline.

## Milestone 11: SEO, RSS, And Sitemap

- [ ] Add title and description metadata from normalized frontmatter.
- [ ] Add canonical URLs using the new `/articles/:slug/` structure.
- [ ] Add Open Graph and Twitter metadata using `excerpt` and `image` when
      available.
- [ ] Add `@astrojs/rss` and generate `/feed.xml`.
- [ ] Add `@astrojs/sitemap`.
- [ ] Ensure the Astro config `site` value is set to the production origin.
- [ ] Include only published articles in RSS and sitemap output.
- [ ] Decide whether to add `robots.txt`.

- [ ] Article pages have correct document titles and social metadata.
- [ ] `/feed.xml` builds and includes the expected article items.
- [ ] Sitemap output builds successfully from static routes.
- [ ] RSS and sitemap use new canonical URLs, not old dated URLs.

## Milestone 12: Jekyll Removal And Repo Cleanup

- [ ] Remove or archive Jekyll-only implementation files after Astro reaches
      feature parity for the chosen scope.
- [ ] Remove `Gemfile`, `Rakefile`, `just-the-docs.gemspec`, `bin/`, `lib/`, and
      Docker Jekyll files if no longer needed.
- [ ] Remove `_layouts`, `_includes`, and `_sass` from the active build path.
- [ ] Remove generated legacy files such as old `feed.xml` when Astro replaces
      them.
- [ ] Update `.gitignore` for Astro output and tooling.
- [ ] Update README with Astro development, build, and deployment commands.
- [ ] Remove or replace Jekyll/Gem GitHub Actions workflows.
- [ ] Keep source content, static assets, and domain files intact.

- [ ] The repo no longer requires Ruby, Bundler, Jekyll, or Just the Docs for the
      production build.
- [ ] Documentation describes the Astro workflow accurately.
- [ ] CI no longer runs Jekyll jobs.
- [ ] Cleanup does not delete source content or required static assets.

## Milestone 13: Verification

- [ ] Run `bun run build`.
- [ ] Run `bun run preview` and smoke-test the generated site.
- [ ] Verify all expected article routes return 200.
- [ ] Verify `/articles/`, `/topics/`, every `/topics/:topic/`, `/about/`, `/`,
      `/feed.xml`, and `/404/`.
- [ ] Run an internal link check against the built site.
- [ ] Check that image requests under `/assets/` and `/uploads/` resolve.
- [ ] Check representative articles with raw HTML-heavy content.
- [ ] Check representative articles whose old permalink slug differs from the
      filename slug.
- [ ] Check mobile layout for navigation and article readability.
- [ ] Check that production output contains no Jekyll Liquid artifacts.

- [ ] Build passes locally.
- [ ] Static preview passes route, link, asset, and visual smoke checks.
- [ ] Known edge-case articles render correctly.
- [ ] The generated route list matches the intended new site structure.

## Milestone 14: Deployment

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
