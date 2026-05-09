# Unused Assets

This directory contains image and media files that are not currently referenced
by the site.

Do not reference files from this directory in articles, layouts, or components.
If an asset becomes useful again, move it into the appropriate folder under
`site/assets/` first:

- `site/assets/articles/<article-slug>/` for assets owned by one article.
- `site/assets/shared/` for assets reused by multiple articles or pages.
- `site/assets/site/` for homepage, layout, and other site UI assets.

After moving an asset, update the article or component reference to point at the
new `site/assets/...` or `@site/assets/...` location so Astro can validate and
process it during build.
