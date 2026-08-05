/* ============================================================
   build-blog.mjs
   Compiles content/posts/*.md into:
     - blog-posts.json         (card data for the /blog grid)
     - blog/<slug>/index.html  (a real, indexable page per post,
       with the matching interactive tool embedded inline if the
       post's frontmatter sets `embed:`)
   Zero dependencies. Runs in the GitHub Action on every push,
   and locally with:  node scripts/build-blog.mjs
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as carpetAreaCalculator from './embeds/carpet-area-calculator.mjs';
import * as costCalculator from './embeds/cost-calculator.mjs';
import * as vastuChecker from './embeds/vastu-checker.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'content', 'posts');
const BLOG_DIR = join(ROOT, 'blog');
const SITE_URL = 'https://crabdesignstudio.com';

const EMBEDS = {
  'carpet-area-calculator': carpetAreaCalculator,
  'cost-calculator': costCalculator,
  'vastu-checker': vastuChecker,
};

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
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function assetPath(src) {
  if (/^https?:\/\//i.test(src)) return src;
  return src.replace(/^\/+/, '');
}

/* small, dependency-free markdown -> HTML for post bodies.
   Supports what a Journal writer actually needs: paragraphs, ## / ###
   headings, **bold**, *italic*, [links](url), ![images](url) — both
   inline and as their own standalone figure — and > blockquotes for
   pull quotes. Anything else is left as plain escaped text. */
function inlineMd(escaped) {
  return escaped
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${assetPath(src)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => `<a href="${href}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function parseTable(block) {
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const isRow = l => /^\|.*\|$/.test(l);
  const isSeparator = l => /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(l);
  if (!isRow(lines[0]) || !isSeparator(lines[1])) return null;

  const cells = l => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  return { header: cells(lines[0]), rows: lines.slice(2).filter(isRow).map(cells) };
}

function slugifyText(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mdToHtml(body) {
  const blocks = body.split(/\r?\n\s*\r?\n/).map(b => b.trim()).filter(Boolean);
  const headings = [];

  const html = blocks.map(block => {
    const collapsed = block.replace(/\s+/g, ' ').trim();

    const table = parseTable(block);
    if (table) {
      const th = table.header.map(c => `<th>${inlineMd(esc(c))}</th>`).join('');
      const rows = table.rows.map(r => `<tr>${r.map(c => `<td>${inlineMd(esc(c))}</td>`).join('')}</tr>`).join('');
      return `<div class="post-table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    const listLines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const isUnordered = listLines.length > 0 && listLines.every(l => /^[-*]\s+/.test(l));
    const isOrdered = listLines.length > 0 && listLines.every(l => /^\d+\.\s+/.test(l));
    if (isUnordered || isOrdered) {
      const tag = isUnordered ? 'ul' : 'ol';
      const items = listLines
        .map(l => l.replace(/^(?:[-*]|\d+\.)\s+/, ''))
        .map(item => `<li>${inlineMd(esc(item))}</li>`)
        .join('');
      return `<${tag}>${items}</${tag}>`;
    }

    const heading3 = block.match(/^###\s+(.*)$/);
    if (heading3) return `<h3>${inlineMd(esc(heading3[1].trim()))}</h3>`;

    const heading2 = block.match(/^##\s+(.*)$/);
    if (heading2) {
      const text = heading2[1].trim();
      const id = slugifyText(text);
      headings.push({ text, id });
      return `<h2 id="${id}">${inlineMd(esc(text))}</h2>`;
    }

    const soloImage = collapsed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (soloImage) {
      const [, alt, src] = soloImage;
      const caption = alt ? `<figcaption>${esc(alt)}</figcaption>` : '';
      return `<figure class="post-figure"><img src="${assetPath(src)}" alt="${esc(alt)}" loading="lazy">${caption}</figure>`;
    }

    if (/^>\s?/.test(block)) {
      const quote = block.split(/\r?\n/).map(l => l.replace(/^>\s?/, '')).join(' ').replace(/\s+/g, ' ').trim();
      return `<blockquote><p>${inlineMd(esc(quote))}</p></blockquote>`;
    }

    return `<p>${inlineMd(esc(collapsed))}</p>`;
  });

  return { html, headings };
}

function slugify(filename) {
  return filename.replace(/\.md$/, '');
}

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

const posts = files.map(file => {
  const { data, body } = parse(readFileSync(join(POSTS_DIR, file), 'utf8'));
  const { html: bodyHtml, headings } = mdToHtml(body);
  return {
    slug:     slugify(file),
    title:    data.title    || 'Untitled',
    category: data.category || '',
    date:     data.date     || '',
    image:    data.image    || '',
    excerpt:  data.excerpt  || '',
    embed:    data.embed    || '',
    bodyHtml,
    headings
  };
});

// newest first; undated posts sink to the bottom
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ── blog-posts.json (grid data) ──────────────────────────────
writeFileSync(
  join(ROOT, 'blog-posts.json'),
  JSON.stringify({ posts: posts.map(({ slug, title, category, date, image, excerpt }) =>
    ({ slug, title, category, date, image, excerpt })) }, null, 2) + '\n'
);

// ── per-post static pages ────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso || '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderPost(post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const embed = EMBEDS[post.embed];
  const meta = [post.category, fmtDate(post.date)].filter(Boolean).join('  ·  ');
  const imageUrl = `${SITE_URL}/${post.image ? assetPath(post.image) : 'assets/hero.jpg'}`;

  const bodyHtml = post.bodyHtml.map(b => `      ${b}`).join('\n');
  const heroHtml = post.image
    ? `    <img class="post-hero" src="${esc(assetPath(post.image))}" alt="${esc(post.title)}">\n`
    : '';

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    image: imageUrl,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'CRAB Design Studio' },
    publisher: { '@type': 'Organization', name: 'CRAB Design Studio', logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo.png` } }
  }];
  if (embed) jsonLd.push(embed.faqJsonLd);

  const embedHtml = embed ? `\n${embed.html}\n\n${embed.faqHtml}\n` : '';
  const embedScript = embed ? `\n<script src="tools.js"></script>\n<script>${embed.script}</script>\n` : '';

  // ── right sidebar: table of contents + related posts in the same category ─
  // Note: these pages set <base href="../../"> so relative asset paths resolve
  // from the site root — which means a bare "#id" link resolves against that
  // base (i.e. the homepage), not this page. Anchors must include the full
  // path back to this post so they land on the same document.
  const toc = post.headings.length >= 2
    ? `<nav class="post-toc"><p class="post-sidebar__label">In this article</p><ul>${
        post.headings.map(h => `<li><a href="blog/${post.slug}/#${h.id}">${esc(h.text)}</a></li>`).join('')
      }</ul></nav>`
    : '';

  const relatedPosts = posts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  const related = relatedPosts.length
    ? `<div class="post-related"><p class="post-sidebar__label">Related reading</p><ul>${
        relatedPosts.map(p => `<li><a href="blog/${p.slug}/">${esc(p.title)}</a></li>`).join('')
      }</ul></div>`
    : '';

  const hasSidebar = Boolean(toc || related);
  const sidebarHtml = hasSidebar ? `\n    <aside class="post-sidebar">\n      ${toc}\n      ${related}\n    </aside>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- This page lives at /blog/${post.slug}/ ; resolve assets from the site root. -->
<base href="../../">
<title>${esc(post.title)} — CRAB Design Studio</title>
<meta name="description" content="${esc(post.excerpt)}">
<meta name="theme-color" content="#040404">
<link rel="canonical" href="${url}">

<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.excerpt)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="CRAB Design Studio">
<meta property="og:image" content="${imageUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(post.excerpt)}">
<meta name="twitter:image" content="${imageUrl}">

<link rel="icon" type="image/png" sizes="256x256" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=11">

${jsonLd.map(ld => `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`).join('\n')}
</head>
<body class="page-blog">

<div class="grain" aria-hidden="true"></div>

<div class="shell shell--blog">

  <header class="header">
    <a href="./" class="logo" aria-label="CRAB Design Studio">
      <img class="logo-mark" src="assets/logo.png" width="674" height="240" alt="CRAB Design Studio">
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="./">Home</a>
      <span class="sep" aria-hidden="true"></span>
      <a href="blog/" aria-current="page">Journal</a>
    </nav>
  </header>

  <main>
    <a class="tool-back" href="blog/">&larr; All posts</a>

    <div class="${hasSidebar ? 'post-layout' : ''}">
    <article>
${heroHtml}      <p class="post-meta">${esc(meta)}</p>
      <h1 class="blog-title" style="font-size: clamp(1.9rem, 4.4vw, 3rem); margin-bottom: 1.6rem;">${esc(post.title)}</h1>

      <div class="post-body">
${bodyHtml}
      </div>
${embedHtml}    </article>
${sidebarHtml}
    </div>
  </main>

  <footer class="footer">
    <ul class="social">
      <li><a href="https://www.instagram.com/crabdesign_studio/" target="_blank" rel="noopener">Instagram</a></li>
      <li><a href="https://www.linkedin.com/crab_design_studio" target="_blank" rel="noopener">LinkedIn</a></li>
      <li><a href="#">Behance</a></li>
    </ul>
    <p class="copyright">&copy; 2026 CRAB Design Studio</p>
  </footer>

</div>
${embedScript}</body>
</html>
`;
}

for (const post of posts) {
  const dir = join(BLOG_DIR, post.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), renderPost(post));
}

// ── sitemap.xml (static top-level pages + one entry per post) ─
function urlEntry(loc, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const sitemapUrls = [
  urlEntry(`${SITE_URL}/`, 'weekly', '1.0'),
  urlEntry(`${SITE_URL}/blog`, 'weekly', '0.8'),
  ...posts.map(p => urlEntry(`${SITE_URL}/blog/${p.slug}`, 'monthly', '0.7')),
];

writeFileSync(
  join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`
);

console.log(`build-blog: wrote ${posts.length} post page(s) + blog-posts.json + sitemap.xml`);
