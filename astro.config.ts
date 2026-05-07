import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { articleImagePolicyCacheKey } from "./src/lib/article-image-policy";
import { siteConfig } from "./src/lib/site-config";
import { projectRelativePath, siteInstance } from "./src/lib/site-instance";
import { siteRedirects } from "./src/lib/site-redirects";
import {
  rehypeArticleImages,
  remarkArticleImageMarkers,
} from "./src/rehype-plugins/articleImages";
import { remarkArticleReferences } from "./src/remark-plugins/articleReferences";

export default defineConfig({
  compressHTML: true,
  image: {
    breakpoints: [384, 640, 750, 828, 1080, 1280, 1668, 2048, 2560],
    layout: "constrained",
    responsiveStyles: false,
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      [rehypeArticleImages, { policyCacheKey: articleImagePolicyCacheKey }],
    ],
    remarkPlugins: [
      [
        remarkArticleImageMarkers,
        { policyCacheKey: articleImagePolicyCacheKey },
      ],
      [remarkArticleReferences, { validateLegacyFootnotes: true }],
    ],
  },
  publicDir: projectRelativePath(siteInstance.public),
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: false,
  },
  prerenderConflictBehavior: "error",
  redirects: siteRedirects,
  site: siteConfig.identity.url,
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@site/assets": siteInstance.assets.root,
      },
    },
    server: {
      fs: {
        allow: [process.cwd(), siteInstance.root],
      },
    },
  },
});
