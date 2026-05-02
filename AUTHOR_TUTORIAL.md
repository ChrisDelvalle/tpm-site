# Author Tutorial

This guide is for article authors who want to submit a new article to The
Philosopher's Meme. It assumes you are not familiar with Git, GitHub, branches,
commits, or pull requests.

You do not need to edit the website code to publish a normal article. Most of
the time, you will add one Markdown file and, optionally, some image files.

The GitHub repository is:

```text
https://github.com/seongyher/tpm-site.git
```

## Plain-English GitHub Terms

- **Repository**: the project folder on GitHub. This site lives at
  `https://github.com/seongyher/tpm-site`.
- **Clone**: download a copy of the repository to your computer.
- **Pull**: update your local copy with the latest changes from GitHub.
- **Branch**: a safe working copy for your article. You make changes on a
  branch so the live site is not changed immediately.
- **Commit**: a saved snapshot of your changes with a short message.
- **Push**: upload your branch and commits to GitHub.
- **Pull request**: a request for maintainers to review your branch and merge it
  into the site.
- **Merge**: accept the pull request. After merging to `main`, GitHub builds
  and publishes the site.

## Recommended Tools

Install these first:

1. **Git**: required for working with the repository.
   Install it from `https://git-scm.com/install`.
2. **GitHub Desktop**: easiest way to pull, branch, commit, push, and open a
   pull request. Install it from `https://github.com/apps/desktop`.
3. **A text editor**: Visual Studio Code is a good default.
4. **Bun**: used to run site checks locally.
   Install it from `https://bun.com/docs/installation`.

If you do not want to use the terminal at all, you can still submit an article
with GitHub Desktop and let GitHub run the checks after you open a pull request.
Running checks locally is recommended, but maintainers can help with failures.

## What You Will Add

Most articles need only:

- one Markdown file in `src/content/articles/<category>/`;
- optional images in `src/assets/articles/<article-slug>/`;
- a pull request for review.

Use `.md` for normal articles. Use `.mdx` only when a maintainer tells you the
article needs custom components.

## 1. Get The Site On Your Computer

### GitHub Desktop

1. Open GitHub Desktop.
2. Choose **File > Clone repository**.
3. Choose the **URL** tab.
4. Paste:

   ```text
   https://github.com/seongyher/tpm-site.git
   ```

5. Choose where the folder should live on your computer.
6. Click **Clone**.

If GitHub says you do not have permission to push changes, ask a maintainer for
access or ask them whether they want you to submit from a fork.

### Terminal Option

If you are comfortable with the terminal:

```sh
git clone https://github.com/seongyher/tpm-site.git
cd tpm-site
```

## 2. Get The Latest Version Before You Start

Always update your local copy before starting a new article.

### GitHub Desktop

1. Open the repository in GitHub Desktop.
2. Click **Fetch origin**.
3. If the button changes to **Pull origin**, click **Pull origin**.

### Terminal Option

```sh
git switch main
git pull
```

## 3. Create A Branch For Your Article

A branch keeps your article changes separate until they are reviewed.

### GitHub Desktop

1. Click the **Current Branch** menu.
2. Click **New Branch**.
3. Name it something short, such as:

   ```text
   article/my-new-article
   ```

4. Click **Create Branch**.

### Terminal Option

```sh
git switch -c article/my-new-article
```

Use lowercase words and hyphens in branch names.

## 4. Pick A Category

Current article category folders are:

- `src/content/articles/aesthetics/`
- `src/content/articles/game-studies/`
- `src/content/articles/history/`
- `src/content/articles/irony/`
- `src/content/articles/memeculture/` (`Culture`)
- `src/content/articles/metamemetics/`
- `src/content/articles/philosophy/`
- `src/content/articles/politics/`

Ask a maintainer before creating a new category.

## 5. Make A New Category

Most authors should use an existing category. Only make a new category if a
maintainer agrees that the site needs one.

A category needs two things:

1. a folder for articles;
2. a matching metadata file for the category title and order.

Example new category:

```text
src/content/articles/media-theory/
src/content/categories/media-theory.json
```

The folder name becomes the category URL:

```text
/categories/media-theory/
```

Category folder rules:

- use lowercase letters, numbers, and hyphens;
- do not use spaces;
- keep the folder name short and readable.

The metadata file must use the same name as the folder. For
`src/content/articles/media-theory/`, create:

```text
src/content/categories/media-theory.json
```

Start with this JSON:

```json
{
  "title": "Media Theory",
  "order": 9
}
```

Optional category description:

```json
{
  "title": "Media Theory",
  "description": "Articles about media theory and internet culture.",
  "order": 9
}
```

`title` is the display name. `order` controls where the category appears in
category navigation. Pick the next sensible number, or ask a maintainer where it
should go.

After adding a category, put the article in the new folder:

```text
src/content/articles/media-theory/my-new-article.md
```

## 6. Pick The Article Slug

The filename becomes the public URL.

Example:

```text
src/content/articles/history/my-new-article.md
```

becomes:

```text
/articles/my-new-article/
```

Slug rules:

- use lowercase letters, numbers, and hyphens;
- do not use spaces;
- do not include the date;
- keep it short and readable.

Good:

```text
my-new-article.md
```

Avoid:

```text
2026-04-30 My New Article.markdown
```

## 7. Create The Article File

Create a new `.md` file in the category folder.

Example path:

```text
src/content/articles/history/my-new-article.md
```

Start with this template:

```md
---
title: "My New Article"
description: "A short one-sentence summary for search, feeds, and previews."
date: 2026-04-30
author: "Author Name"
tags:
  - example tag
image: "../../../assets/articles/my-new-article/cover.png"
imageAlt: "Short description of the cover image."
---

Article body starts here.
```

Notes:

- `title` is the article title shown on the page.
- `description` should be brief and useful.
- `date` should use `YYYY-MM-DD`.
- `author` should be the display name.
- `tags` are optional, but useful.
- `image` and `imageAlt` are optional, but recommended when the article has a
  preview image.
- Add `draft: true` if the article should not publish yet.

Do not add `slug`, `category`, or `topic` frontmatter. The slug comes from the
filename. The category comes from the folder.

## 8. Write The Article Body

The article title is already the page's main heading. Inside the article body,
start headings at `##`, not `#`.

Use:

```md
## Introduction

Text here.

### A Smaller Section

More text here.
```

Avoid:

```md
# Introduction
```

## 9. Add Images

Put article images in a folder that matches the article slug:

```text
src/assets/articles/my-new-article/
  cover.png
  diagram.png
```

Reference images from the article with a relative path:

```md
![Alt text describing the image](../../../assets/articles/my-new-article/diagram.png)
```

For a preview image in frontmatter:

```yaml
image: "../../../assets/articles/my-new-article/cover.png"
imageAlt: "Short description of the cover image."
```

If an image is shared by multiple articles, put it in:

```text
src/assets/shared/
```

Do not put article images in `public/`, root-level folders, `uploads/`, or
`assets/`. Images should normally go through `src/assets/`.

Alt text should describe the image for a reader who cannot see it. Keep it
plain and specific.

## 10. Check The Site Locally

If you can use the terminal, install dependencies once:

```sh
bun install
```

Run the normal checks:

```sh
bun run check
bun run build
bun run verify
```

Helpful review checks:

```sh
bun run review:markdown
bun run review:assets
```

If a check reports a formatting or linting issue, you can try the safe automatic
fix command:

```sh
bun run fix
```

Then run the checks again. `bun run fix` is meant for code and config files. If
Markdown review asks for mechanical Markdown formatting, use this separately:

```sh
bun run fix:markdown
```

Only run Markdown formatting when you are comfortable reviewing the article diff
afterward.

Preview the built site:

```sh
bun run preview:fresh
```

Then open the local preview URL shown in the terminal.

## 11. Common Problems

If the check says the filename is not URL-safe, rename the article so it uses
only lowercase letters, numbers, and hyphens.

If the check says there is a duplicate slug, another article already uses that
filename. Pick a different filename.

If the check says a category folder or category metadata filename is not
URL-safe, rename it so it uses only lowercase letters, numbers, and hyphens.

If the check says an image is outside `src/assets/`, move it into
`src/assets/articles/<article-slug>/` or `src/assets/shared/`.

If Markdown review complains about multiple `H1` headings, change body headings
from `#` to `##`, `##` to `###`, and so on.

## 12. Save Your Changes As A Commit

A commit is a saved snapshot of your article changes.

### GitHub Desktop

1. Open GitHub Desktop.
2. Click the **Changes** tab.
3. Review the changed files. Make sure you only changed the article and related
   assets.
4. In the **Summary** box, write a short message, such as:

   ```text
   Add my new article
   ```

5. Click **Commit to article/my-new-article**.

### Terminal Option

```sh
git add src/content/articles src/assets
git commit -m "Add my new article"
```

## 13. Push Your Branch To GitHub

Pushing uploads your branch to GitHub so maintainers can review it.

### GitHub Desktop

Click **Push origin**.

### Terminal Option

```sh
git push -u origin article/my-new-article
```

## 14. Open A Pull Request

A pull request is how you ask maintainers to review and publish your article.

### GitHub Desktop

1. After pushing, GitHub Desktop should show a **Preview Pull Request** or
   **Create Pull Request** button.
2. Click it. GitHub will open in your browser.
3. Set the pull request title to something clear, such as:

   ```text
   Add my new article
   ```

4. In the description, include anything reviewers should know.
5. Click **Create pull request**.

### GitHub Website

If GitHub Desktop does not show the button:

1. Go to `https://github.com/seongyher/tpm-site`.
2. GitHub may show a banner for your recently pushed branch.
3. Click **Compare & pull request**.
4. Check that the base branch is `main`.
5. Check that the compare branch is your article branch.
6. Click **Create pull request**.

## 15. Wait For Checks And Review

After you open a pull request, GitHub runs automatic checks.

Blocking checks must pass before the article can be merged. Review-only checks
are useful warnings but do not automatically block publishing.

If a check fails:

1. Open the failed check on GitHub.
2. Read the message. It usually lists the file and problem.
3. If you know how to fix it, make the fix locally.
4. Commit the fix.
5. Push again. The pull request updates automatically.

If you do not understand the failure, leave a comment on the pull request and
ask a maintainer for help.

## 16. Respond To Review Comments

Maintainers may leave comments or request changes.

If they ask for changes:

1. Make the requested edits on the same branch.
2. Commit the edits.
3. Push again.
4. Reply to the comment if needed.

Do not open a second pull request for the same article unless a maintainer asks.

## 17. Pull Request Checklist

Before asking for review:

- The article file is in the right category folder.
- New categories, if any, have a matching folder and JSON metadata file.
- The filename slug is URL-safe.
- The frontmatter has `title`, `description`, `date`, and `author`.
- Images live under `src/assets/`.
- Meaningful images have alt text.
- Body headings start at `##`, not `#`.
- `bun run check`, `bun run build`, and `bun run verify` pass if you can run
  local checks.

GitHub will run additional checks after you open the pull request. Some checks
are review warnings only. A maintainer can help interpret them.
