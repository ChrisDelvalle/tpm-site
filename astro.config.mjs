import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

function normalizeLegacyHtml(value) {
  return value
    .replace(/<img\b(?![^>]*\salt=)([^>]*)>/gi, '<img$1 alt="">')
    .replace(
      /<iframe\b(?![^>]*\stitle=)([^>]*)>/gi,
      '<iframe$1 title="Embedded content">',
    );
}

function remarkJekyllBaseUrl() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== "object") {
        return;
      }

      for (const key of ["value", "url"]) {
        if (typeof node[key] === "string") {
          node[key] = normalizeLegacyHtml(node[key])
            .replaceAll("{{ site.baseurl }}", "")
            .replaceAll(
              'href="/glossary/#',
              'href="/articles/glossary-1-dot-0/#',
            )
            .replaceAll(
              "href='/glossary/#",
              "href='/articles/glossary-1-dot-0/#",
            );
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

function normalizeLegacyPath(value, key) {
  const normalizedValue = value.replaceAll("{{ site.baseurl }}", "");

  if (
    key === "href" &&
    (normalizedValue === "/glossary/" ||
      normalizedValue.startsWith("/glossary/#"))
  ) {
    return normalizedValue.replace("/glossary/", "/articles/glossary-1-dot-0/");
  }

  return normalizedValue;
}

function normalizeLegacyElement(node) {
  if (!node.properties || typeof node.properties !== "object") {
    return;
  }

  if (node.tagName === "img" && node.properties.alt === undefined) {
    node.properties.alt = "";
  }

  if (node.tagName === "iframe" && node.properties.title === undefined) {
    node.properties.title = "Embedded content";
  }

  for (const key of ["href", "src"]) {
    if (typeof node.properties[key] === "string") {
      node.properties[key] = normalizeLegacyPath(node.properties[key], key);
    }
  }
}

function rehypeLegacyLinks() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== "object") {
        return;
      }

      if (typeof node.value === "string") {
        node.value = normalizeLegacyHtml(node.value);
      }

      normalizeLegacyElement(node);

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
  integrations: [mdx(), sitemap(), react()],
  markdown: {
    remarkPlugins: [remarkJekyllBaseUrl],
    rehypePlugins: [rehypeLegacyLinks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
