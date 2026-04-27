import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

function remarkJekyllBaseUrl() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== "object") return;

      for (const key of ["value", "url"]) {
        if (typeof node[key] === "string") {
          node[key] = node[key]
            .replaceAll("{{ site.baseurl }}", "")
            .replaceAll("href=\"/glossary/#", "href=\"/articles/glossary-1-dot-0/#")
            .replaceAll("href='/glossary/#", "href='/articles/glossary-1-dot-0/#");
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

function rehypeLegacyLinks() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== "object") return;

      if (node.properties && typeof node.properties === "object") {
        for (const key of ["href", "src"]) {
          if (typeof node.properties[key] === "string") {
            node.properties[key] = node.properties[key].replaceAll(
              "{{ site.baseurl }}",
              "",
            );

            if (
              key === "href" &&
              (node.properties[key] === "/glossary/" ||
                node.properties[key].startsWith("/glossary/#"))
            ) {
              node.properties[key] = node.properties[key].replace(
                "/glossary/",
                "/articles/glossary-1-dot-0/",
              );
            }
          }
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

export default defineConfig({
  site: "https://thephilosophersmeme.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkJekyllBaseUrl],
    rehypePlugins: [rehypeLegacyLinks],
  },
});
