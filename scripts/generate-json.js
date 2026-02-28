#!/usr/bin/env node

/**
 * generate-json.js
 * Reads all Markdown posts, extracts front matter,
 * converts content to HTML, and outputs dist/posts.json
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Minimal dependencies (pure Node — no npm install required for basic usage)
// ---------------------------------------------------------------------------

/** Parse YAML front matter from a Markdown string. Returns { data, content } */
function parseFrontMatter(raw) {
  const FM_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = raw.match(FM_REGEX);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const markdownContent = match[2];

  // Simple YAML parser (handles strings, dates, booleans, arrays)
  const data = {};
  const lines = yamlBlock.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (!keyMatch) { i++; continue; }

    const key = keyMatch[1];
    const rest = keyMatch[2].trim();

    // Array value (next lines start with "- ")
    if (rest === "") {
      const arr = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s+-\s+/)) {
        arr.push(lines[i].replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, ""));
        i++;
      }
      data[key] = arr;
      continue;
    }

    // Inline array: ["a", "b"]
    if (rest.startsWith("[")) {
      data[key] = JSON.parse(rest.replace(/'/g, '"'));
      i++;
      continue;
    }

    // Boolean
    if (rest === "true") { data[key] = true; i++; continue; }
    if (rest === "false") { data[key] = false; i++; continue; }

    // Date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(rest)) { data[key] = rest; i++; continue; }

    // String (strip surrounding quotes)
    data[key] = rest.replace(/^["']|["']$/g, "");
    i++;
  }

  return { data, content: markdownContent };
}

/** Convert Markdown to basic HTML (headings, bold, italic, code, paragraphs) */
function markdownToHtml(md) {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
    // Headings
    .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Unordered list items
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Wrap consecutive <li> tags in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`);

  // Wrap plain-text paragraphs (lines not starting with HTML tags)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-6]|ul|ol|li|pre|hr|blockquote)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const POSTS_DIR = path.join(__dirname, "../content/posts");
const DIST_DIR = path.join(__dirname, "../dist");
const OUTPUT_FILE = path.join(DIST_DIR, "posts.json");

function generateJson() {
  console.log("📖 Reading posts from:", POSTS_DIR);

  if (!fs.existsSync(POSTS_DIR)) {
    console.error("❌ Posts directory not found:", POSTS_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));

  console.log(`📄 Found ${files.length} post(s)`);

  const posts = files
    .map((filename) => {
      const filepath = path.join(POSTS_DIR, filename);
      const raw = fs.readFileSync(filepath, "utf-8");
      const { data, content } = parseFrontMatter(raw);

      // Skip drafts
      if (data.draft === true) {
        console.log(`  ⏭  Skipping draft: ${filename}`);
        return null;
      }

      const post = {
        title: data.title || "",
        slug: data.slug || filename.replace(".md", ""),
        date: data.date || "",
        summary: data.summary || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: data.featured === true,
        content: markdownToHtml(content),
      };

      console.log(`  ✅ Processed: ${post.slug}`);
      return post;
    })
    .filter(Boolean)
    // Sort by date descending (newest first)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Ensure dist/ exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf-8");
  console.log(`\n✨ Generated: ${OUTPUT_FILE}`);
  console.log(`📦 Total posts: ${posts.length}`);
}

generateJson();
