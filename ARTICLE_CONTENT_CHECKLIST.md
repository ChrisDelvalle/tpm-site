# Article Content Checklist

This checklist isolates Markdown, MDX, article frontmatter, and article-owned
asset work from the main migration checklist.

Content work is high-risk because it can accidentally alter authorial wording,
citations, formatting, or article intent. Do not edit article source as an
incidental part of code cleanup.

## Rules

- Do not edit `src/content/articles/` or `src/content/pages/` unless the user
  explicitly asks for content-source changes.
- Preserve author wording exactly unless the user explicitly asks for prose
  changes.
- Make content changes in small, reviewable batches.
- Prefer exact mechanical edits over broad rewrites.
- Do not bulk-format article Markdown or MDX unless formatting article source is
  the explicit task.
- Manually verify every changed article after rendering.
- If intent is unclear, report the issue instead of guessing.

## Current Baseline

- [x] Article source lives under `src/content/articles/<category>/`.
- [x] Page Markdown source lives under `src/content/pages/`.
- [x] Current article source count is 61 files: 58 `.md` files and 3 `.mdx`
      files.
- [x] Current page source count is 1 `.md` file.
- [x] No `.markdown` article or page files remain.
- [x] Legacy runtime frontmatter fields such as `permalink`, `excerpt`,
      `layout`, `parent`, `published`, `status`, `topic`, `category`, and
      `slug` have been removed from current article source.
- [x] `legacyPermalink` remains as inert posterity metadata.
- [x] `legacyBanner` remains as inert posterity metadata where present.
- [x] One unpublished article is represented with `draft: true`.
- [x] No `{{ site.baseurl }}` or Liquid syntax was found in current article or
      page source.
- [x] No root-relative `/glossary/` article links were found in current article
      or page source.
- [x] The remaining old glossary URL is an absolute historical link and is not
      rewritten by the current Markdown compatibility transforms.
- [x] Local raw image tags and hover-image links that required Astro image
      handling have been converted to MDX components.

## Required Before Removing Legacy Markdown Transforms

- [x] Re-scan article and page source for `{{ site.baseurl }}` and Liquid
      syntax immediately before removing Markdown compatibility transforms.
- [x] Re-scan article and page source for root-relative `/glossary/` links
      immediately before removing Markdown compatibility transforms.
- [x] Confirm no article source still relies on the `{{ site.baseurl }}` or
      root-relative glossary rewrite transforms in `astro.config.mjs`.
- [x] After removing compatibility transforms, build the site and verify
      representative Markdown-heavy and MDX-heavy articles render correctly.
- [x] Keep the build verifier checking that Liquid artifacts do not reach built
      output.

## Known Manual Review Items

- [ ] Review the old glossary URL in
      `src/content/articles/history/death-of-a-meme-or-how-leo-learned-to-stop-worrying-and-love-the-bear.md`.
- [ ] Review the extra `>` after a closing paragraph tag in
      `src/content/articles/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md`.
- [ ] Decide whether the remaining remote Discord CDN `<img>` references should
      stay remote or be migrated into `src/assets/`.
- [ ] Review WordPress-style paragraph/span markup in
      `src/content/articles/memeculture/newfriends-and-the-generation-gap.md`
      before any cleanup.
- [ ] Review legacy caption `<div class="caption">` markup before deciding
      whether to keep raw HTML, create a component, or convert to Markdown.
- [ ] Review raw HTML tables before deciding whether conversion to Markdown is
      safe.
- [ ] Review iframe embeds only for rendering, accessibility, and layout; raw
      iframe HTML is acceptable when it expresses the intended embed.

## Optional Cleanup, Not Migration Blockers

- [ ] Convert mechanically safe raw HTML to Markdown only after explicit
      approval.
- [ ] Add or improve image alt text only when the intended description is clear
      or supplied by the user.
- [ ] Convert MDX articles back to Markdown only if they no longer need
      components.
- [ ] Migrate remote article images into `src/assets/` only after deciding that
      preserving a local copy is worth the source-content change.

## Manual Verification Protocol

- [ ] Inspect the git diff before and after every content-source change.
- [ ] Verify no author wording changed unless explicitly requested.
- [ ] Run the relevant repository checks after content changes.
- [ ] Build or preview affected pages and visually inspect changed articles.
- [ ] Verify article images, embeds, captions, links, headings, and tables still
      render as intended.
- [ ] For MDX changes, verify imports, component props, generated HTML, and
      hydration behavior where relevant.

## Final Content Gate

- [ ] No required content-sensitive item remains unresolved.
- [ ] Any remaining raw HTML is intentional article content, not a dependency on
      migration-only render transforms.
- [ ] Article source follows the final frontmatter schema.
- [ ] Draft articles remain unpublished.
- [ ] Article source requires no generated mirror, sync script, Jekyll runtime
      metadata, or Liquid compatibility transform.
