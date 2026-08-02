/* ============================================================
   CRAB Design Studio — Journal
   Loads posts from a content source and renders them.
   No build step, no redeploy: change the source, refresh the page.
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     CONTENT SOURCE

     The page reads posts at load time, so updating content never
     needs a code change or a redeploy — you edit in the CMS, the
     next visitor sees it.

     Option A — Sanity (recommended, free). Fill in projectId to
       switch from the bundled file to your live Sanity dataset.
       Full setup steps are in BLOG.md.

     Option B — bundled JSON (default). Edits to blog-posts.json
       DO require a commit, so this is only the starter/fallback.
     ══════════════════════════════════════════════════════════ */
  var SOURCE = {
    sanity: {
      projectId:  '',              // e.g. 'a1b2c3d4' — leave blank to use the JSON file
      dataset:    'production',
      apiVersion: '2024-01-01'
    },
    localJson: 'blog-posts.json'
  };

  var grid    = document.getElementById('post-grid');
  var elLoad  = document.getElementById('blog-loading');
  var elEmpty = document.getElementById('blog-empty');
  var elError = document.getElementById('blog-error');

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  /* ── fetch ─────────────────────────────────────────────── */

  function load() {
    if (SOURCE.sanity.projectId) {
      return fetchSanity();
    }
    return fetch(SOURCE.localJson, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { return (data && data.posts) || []; });
  }

  function fetchSanity() {
    var s = SOURCE.sanity;
    // newest first; image resolved to a plain CDN url
    var groq =
      '*[_type=="post"]|order(date desc){' +
      'title,category,date,excerpt,"image":image.asset->url,body}';
    var url = 'https://' + s.projectId + '.apicdn.sanity.io/v' + s.apiVersion +
              '/data/query/' + s.dataset + '?query=' + encodeURIComponent(groq);
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { return (data && data.result) || []; });
  }

  /* ── render ────────────────────────────────────────────── */

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function bodyToParas(body) {
    // accepts an array of strings, or a single string
    if (Array.isArray(body)) return body;
    if (typeof body === 'string') return body.split(/\n{2,}/);
    return [];
  }

  function render(posts) {
    hide(elLoad);

    if (!posts.length) { show(elEmpty); return; }

    posts.forEach(function (post, i) {
      var card = document.createElement('button');
      card.className = 'post';
      card.type = 'button';
      card.style.setProperty('--i', i);

      var meta = [post.category, fmtDate(post.date)].filter(Boolean).join('  ·  ');

      card.innerHTML =
        '<span class="post__media">' +
          (post.image ? '<img src="' + esc(assetUrl(post.image)) + '" alt="" loading="lazy">' : '') +
        '</span>' +
        '<span class="post__meta">' + esc(meta) + '</span>' +
        '<span class="post__title">' + esc(post.title || 'Untitled') + '</span>' +
        '<span class="post__excerpt">' + esc(post.excerpt || '') + '</span>' +
        '<span class="post__more">Read <span aria-hidden="true">&rarr;</span></span>';

      card.addEventListener('click', function () { openReader(post); });
      grid.appendChild(card);
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // The CMS may write image paths with a leading slash (/assets/blog/x.jpg),
  // which is absolute from the domain root and breaks on a project site served
  // under /crab/. Strip it so paths stay relative to the page and work both on
  // the github.io/crab/ URL and on the custom domain root. External URLs pass through.
  function assetUrl(p) {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return p.replace(/^\/+/, '');
  }

  /* ── reader overlay ────────────────────────────────────── */

  var reader = document.getElementById('reader');
  var rImg   = document.getElementById('reader-img');
  var rMeta  = document.getElementById('reader-meta');
  var rTitle = document.getElementById('reader-title');
  var rBody  = document.getElementById('reader-body');
  var lastFocus = null;

  function openReader(post) {
    lastFocus = document.activeElement;

    if (post.image) { rImg.src = assetUrl(post.image); rImg.style.display = ''; }
    else { rImg.removeAttribute('src'); rImg.style.display = 'none'; }

    rMeta.textContent = [post.category, fmtDate(post.date)].filter(Boolean).join('  ·  ');
    rTitle.textContent = post.title || 'Untitled';

    rBody.innerHTML = '';
    bodyToParas(post.body).forEach(function (p) {
      var el = document.createElement('p');
      el.textContent = p;
      rBody.appendChild(el);
    });

    if (post.ctaUrl) {
      var cta = document.createElement('a');
      cta.className = 'reader__cta';
      cta.href = assetUrl(post.ctaUrl);
      cta.textContent = (post.ctaLabel || 'Learn more') + ' →';
      rBody.appendChild(cta);
    }

    reader.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { reader.classList.add('is-open'); });
    reader.querySelector('.reader__close').focus();
  }

  function closeReader() {
    reader.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      reader.hidden = true;
      reader.querySelector('.reader__scroll').scrollTop = 0;
    }, 320);
    if (lastFocus) lastFocus.focus();
  }

  reader.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeReader();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !reader.hidden) closeReader();
  });

  /* ── go ────────────────────────────────────────────────── */

  load()
    .then(render)
    .catch(function () { hide(elLoad); show(elError); });
})();
