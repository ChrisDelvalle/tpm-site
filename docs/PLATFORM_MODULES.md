# Platform Module Boundaries

The platform is reusable engine code. A site instance supplies content, assets,
theme tokens, public files, redirects, and configuration. Platform modules
should make those boundaries obvious enough that future maintainers, site
owners, authors, and GUI tooling can reason about the system without learning
incidental TPM implementation details.

## Domain Map

| Domain                      | Owns                                                                                                                                                              | Current modules                                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content model               | Loading, validating, normalizing, sorting, and aggregating publishable entries and editorial metadata.                                                            | `announcements`, `archive`, `article-continuity`, `article-list`, `article-view`, `authors`, `collections`, `content`, `content-schemas`, `feed`, `home`, `publishable`, `tags` |
| Routes and features         | URL construction, static path helpers, optional feature routes, navigation, SEO, social previews, share targets, site config, site instance paths, and redirects. | `feature-routes`, `navigation`, `routes`, `seo`, `share-targets`, `site-config`, `site-instance`, `site-redirects`, `social-images`, `static-paths`                             |
| Article rendering           | Prose-adjacent article view helpers such as embed media layout, image policy, title fitting, and table-of-contents data.                                          | `article-image-policy`, `article-list-title-fit`, `article-toc`, `embed-media`                                                                                                  |
| PDF and scholarly output    | Article PDF compatibility, PDF output metadata, and PDF generation inputs.                                                                                        | `article-pdf`, `article-pdf-compatibility`                                                                                                                                      |
| References and bibliography | Canonical note/citation parsing, BibTeX parsing, generated article citations, and global bibliography data.                                                       | `article-references/*`, `bibliography`, `citations/article-citation`                                                                                                            |
| Interaction primitives      | Browser-independent positioning/disclosure logic shared by navigation, popovers, and hover/tap surfaces.                                                          | `anchored-disclosure`, `anchored-positioning`                                                                                                                                   |
| Shared utilities            | Small generic helpers that do not own domain behavior.                                                                                                            | `utils`                                                                                                                                                                         |

When a new `src/lib` module is added, it should either fit one of these domains
or the domain map should be expanded deliberately. A file that cannot be named
in this map usually means the abstraction is too vague or the module is doing
work in the wrong layer.

## Boundary Rules

- Platform modules may read site-specific values only through typed adapters:
  `site-config`, `site-instance`, content loaders, or explicit component props.
- Platform modules must not import from `site/` directly. The only core
  exception is `BaseLayout` importing `@site/theme.css`, because the theme file
  is the site-owned CSS token implementation.
- Site assets are accessed through content frontmatter, Markdown/MDX asset
  references, or the `@site/assets` alias in site-owned content. Reusable core
  modules should not import a concrete site asset.
- TPM publication identity, URLs, handles, support links, and editorial copy
  belong in the site instance, not reusable platform code.
- The private component catalog is a platform review surface. It must use
  platform-owned fixture assets and neutral example data instead of depending
  on live TPM assets or copy.
- Route, feature, Pagefind, sitemap, HTML validation, and build verification
  expectations should derive from the same feature model.
- Author-facing behavior should prefer defaults and validation over repeated
  frontmatter. Site owners should configure defaults in `site/config/site.json`.

## CI Invariants

`bun run platform:check` verifies the current enforceable subset:

- every `src/lib` module is assigned to a platform domain;
- reusable core `src/` files do not contain obvious TPM-specific identity,
  support, or social literals;
- reusable core `src/` files do not import unsupported site-instance aliases or
  paths.

This is intentionally not a full architectural proof. It is a narrow guardrail
around the failure modes that are easiest to reintroduce while platformizing.
Catalog source files are included in this check because the catalog now uses
generic platform fixture data.

## Design Review

The boundary is deliberately conservative. It does not create a package system,
workspace split, plugin API, or GUI layer yet. Those would add maintenance
weight before the site-instance contract has settled. The current design keeps
the useful pressure where it belongs: clear domains, typed adapters,
site-owned configuration, repeatable example-site proof, and checks that catch
new TPM leakage before it lands in reusable code.
