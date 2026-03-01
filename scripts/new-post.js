#!/usr/bin/env node

/**
 * new-post.js
 * CLI helper to scaffold a new blog post.
 * Usage: node scripts/new-post.js "Meu Novo Post"
 */

const fs = require("fs");
const path = require("path");

const title = process.argv[2];

if (!title) {
  console.error("❌ Usage: node scripts/new-post.js \"Título do Post\"");
  process.exit(1);
}

const today = new Date().toISOString().split("T")[0];
const slug = title
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")  // remove accents
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const filename = `${slug}.md`;
const filepath = path.join(__dirname, "../content/posts", filename);

if (fs.existsSync(filepath)) {
  console.error(`❌ Post already exists: ${filepath}`);
  process.exit(1);
}

const template = `---
title: "${title}"
date: ${today}
slug: "${slug}"
summary: ""
tags: []
draft: true
featured: false
---

## Introdução

Escreva aqui a introdução do seu post.

## Desenvolvimento

Conteúdo principal aqui.

## Conclusão

Encerre com as principais conclusões.
`;

fs.writeFileSync(filepath, template, "utf-8");
console.log(`✅ Post criado: content/posts/${filename}`);
console.log(`📝 Edite o arquivo e mude "draft: true" para "draft: false" quando estiver pronto.`);

