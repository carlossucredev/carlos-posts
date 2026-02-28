# posts_carlos — Central Content Repository

Single source of truth for all blog content.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/seu-usuario/posts_carlos.git
cd posts_carlos

# Generate posts.json
node scripts/generate-json.js

# Create a new post
node scripts/new-post.js "Título do Novo Post"
```

## Project Structure

```
posts_carlos/
├── content/
│   ├── posts/          ← All blog posts (.md)
│   └── pages/          ← Static pages (about, etc.)
├── scripts/
│   ├── generate-json.js  ← Generates dist/posts.json
│   └── new-post.js       ← CLI to scaffold new posts
├── dist/
│   └── posts.json      ← Static JSON API (auto-generated)
├── hugo.toml           ← Hugo configuration
├── package.json
└── .github/workflows/
    └── build.yml       ← CI/CD pipeline
```

## Adding a New Post

**Option 1 — CLI (recommended):**
```bash
node scripts/new-post.js "Meu Novo Post"
```

**Option 2 — manual:**

Create a file in `content/posts/seu-slug.md` with this front matter:

```markdown
---
title: "Título do Post"
date: 2026-02-28
slug: "titulo-do-post"
summary: "Breve descrição."
tags: ["tag1", "tag2"]
draft: false
featured: false
---

Conteúdo em Markdown aqui.
```

Then run:
```bash
node scripts/generate-json.js
```

## JSON API

The file `dist/posts.json` is generated automatically. Your portfolio fetches it like this:

```javascript
fetch("https://seu-dominio.com/posts.json")
  .then(res => res.json())
  .then(posts => render(posts));
```

## Front Matter Fields

| Field      | Type     | Required | Description                        |
|------------|----------|----------|------------------------------------|
| `title`    | string   | ✅       | Post title                         |
| `date`     | YYYY-MM-DD | ✅     | Publication date                   |
| `slug`     | string   | ✅       | URL-friendly identifier            |
| `summary`  | string   | ✅       | Short description                  |
| `tags`     | string[] | ✅       | List of tags                       |
| `draft`    | boolean  | ✅       | `true` = excluded from JSON output |
| `featured` | boolean  | ❌       | Highlight on homepage              |

## CI/CD

Every push to `main` automatically:
1. Runs `generate-json.js`
2. Builds Hugo site
3. Deploys to GitHub Pages

No manual steps needed.
