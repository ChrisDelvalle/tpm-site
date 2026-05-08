# Platform Docs Site

This is both public documentation and a real example site instance for the
reusable blogging platform.

It is intentionally not a clone of the live site. The content, `theme.css`,
navigation, and site config are neutral documentation material so platform
changes are checked against a second consumer.

Start here as a user:

1. Run the docs site.
2. Edit an article in `examples/docs-site/content/articles/`.
3. Put that article on the homepage with
   `examples/docs-site/content/collections/start-here.md`.
4. Customize labels or navigation in `examples/docs-site/config/site.json`.
5. Change visual identity in `examples/docs-site/theme.css`.
6. Run `bun run test:docs-site`.

Run the example site locally from the repository root:

```sh
bun run docs-site:dev
```

For a production-like local preview:

```sh
bun run docs-site:preview:fresh
```

Run the example site checks:

```sh
bun run test:docs-site
```

These scripts run the platform against the docs-site instance with
`SITE_INSTANCE_ROOT=examples/docs-site`. The check validates the site config
contract and builds the example site.
