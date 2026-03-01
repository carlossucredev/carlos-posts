# Posts Carlos Automation

Every time I wrote a post, I had to update two places manually. This repo fixes that. One Markdown file, one git push, GitHub Actions takes care of the rest — converts the content to JSON, syncs the blog, updates the portfolio.

Without this repo, every new post required:

- ✗ Writing the post in Markdown for the blog
- ✗ Manually converting and copying the content to the portfolio
- ✗ Keeping both in sync when editing

With this repo:

- ✓ Write the post once in Markdown
- ✓ `git push`
- ✓ GitHub Actions syncs both sites automatically

<img width="637" height="657" alt="architecture diagram" src="https://github.com/user-attachments/assets/d8afa753-b51c-4615-b989-e702b88f17bd" />

---

## Quick Start

```bash
git clone https://github.com/carlossucredev/posts-carlos.git
cd posts-carlos

# Generate posts.json
node scripts/generate-json.js

# Create a new post
node scripts/new-post.js "My New Post"
```

## Project Structure

```
posts-carlos/
├── content/
│   └── posts/               ← All blog posts (.md)
├── scripts/
│   ├── generate-json.js     ← Generates dist/posts.json
│   └── new-post.js          ← CLI to scaffold new posts
└── .github/workflows/
    └── build.yml            ← CI/CD pipeline
```

## Adding a New Post

**Option 1 — CLI (recommended)**

```bash
node scripts/new-post.js "My New Post"
```

**Option 2 — manual**

Create a file in `content/posts/your-slug.md`:

```markdown
---
title: "My New Post"
date: 2026-02-28
slug: "my-new-post"
summary: "Short description."
tags: ["tag1", "tag2"]
draft: false
featured: false
---

Content in Markdown here.
```

Then run:

```bash
node scripts/generate-json.js
```

## Front Matter Fields

| Field       | Type       | Required | Description                          |
|-------------|------------|----------|--------------------------------------|
| `title`     | string     | ✅       | Post title                           |
| `date`      | YYYY-MM-DD | ✅       | Publication date                     |
| `slug`      | string     | ✅       | URL-friendly identifier              |
| `summary`   | string     | ✅       | Short description                    |
| `tags`      | string[]   | ✅       | List of tags                         |
| `draft`     | boolean    | ✅       | `true` = excluded from JSON output   |
| `featured`  | boolean    | ❌       | Highlight on homepage                |

## CI/CD

Every push to `main` automatically:

1. Runs `generate-json.js`
2. Copies `.md` files to the Hugo blog repo
3. Copies `posts.json` to the portfolio repo

No manual steps needed.
