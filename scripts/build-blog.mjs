/* ============================================================
   build-blog.mjs
   Compiles content/posts/*.md  ->  blog-posts.json
   Zero dependencies. Runs in the GitHub Action on every push,
   and locally with:  node scripts/build-blog.mjs
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'content', 'posts');
const OUT = join(ROOT, 'blog-posts.json');

/* minimal front-matter parser for our known, simple keys.
   Values are plain scalars (no nested YAML), which keeps this
   dependency-free and predictable. */
function parse(raw) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    // strip matching surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

// body prose -> array of paragraphs (blank-line separated)
function paragraphs(body) {
  return body.split(/\r?\n\s*\r?\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

const posts = files.map(file => {
  const { data, body } = parse(readFileSync(join(POSTS_DIR, file), 'utf8'));
  return {
    title:    data.title    || 'Untitled',
    category: data.category || '',
    date:     data.date     || '',
    image:    data.image    || '',
    excerpt:  data.excerpt  || '',
    ctaLabel: data.cta_label || '',
    ctaUrl:   data.cta_url   || '',
    body:     paragraphs(body)
  };
});

// newest first; undated posts sink to the bottom
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

writeFileSync(OUT, JSON.stringify({ posts }, null, 2) + '\n');
console.log(`build-blog: wrote ${posts.length} post(s) to blog-posts.json`);
