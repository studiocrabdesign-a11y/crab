# CRAB Design Studio — Coming Soon

Static coming-soon page. No build step, no dependencies, no framework.
The files in this folder **are** the site — upload them as-is.

```
index.html      markup
styles.css      all styling
script.js       title reveal, parallax, email form
.nojekyll       tells GitHub Pages to serve files as-is
assets/
  logo.png              supplied logo artwork
  hero.jpg              architectural photograph
  favicon.png           browser tab icon
  apple-touch-icon.png  iOS home-screen icon
```

Total weight: ~90 KB.

---

## Deploy

### GitHub Pages

1. Create a new repository on GitHub.
2. Drag **the contents of this folder** (not the folder itself) onto the
   upload page, or push them to the repo.
3. Repo → **Settings** → **Pages**.
4. Under *Build and deployment*, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
5. Live in about a minute at
   `https://<username>.github.io/<repo-name>/`

`index.html` must sit at the top level of the repo, not inside a subfolder.

### Netlify (fastest — no account needed to preview)

Go to <https://app.netlify.com/drop> and drag this folder onto the page.
It deploys instantly and gives you a URL.

### Any other host

Upload the contents to the web root. Any static host works — Vercel,
Cloudflare Pages, S3, or ordinary shared hosting over FTP.

---

## Before it goes live

- [ ] **Confirm image rights.** `assets/hero.jpg` came from the design
      reference. Check the client owns it or has a licence before publishing.
- [ ] **Connect the email form.** It currently validates and saves to
      `localStorage` only — nothing is sent anywhere and no addresses are
      collected. See below.
- [ ] **Point the social links somewhere.** All three are `href="#"`
      placeholders in `index.html`.
- [ ] **Set the real domain** in the `og:image` meta tag if you want link
      previews to show the photo (relative paths work on some platforms but
      an absolute URL is safer).

---

## Connecting the email form

Open `script.js` and find the block marked:

```js
// ── replace this block with your real submission ──
```

Replace it with a POST to your provider. Formspree example:

```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: new FormData(form)
});
```

Everything around it — validation, the error state, the success message —
already works and needs no changes.

---

## Notes for whoever maintains this

**The background colour and the photo are linked.** The photo's black was
remapped to exactly `rgb(4,4,4)` to match `--bg` in `styles.css`, so the
image blends into the page with no visible edge. If you change `--bg`, the
photo will show as a rectangle and needs remapping to the new value.

**Fonts load from Google Fonts.** If the client needs to avoid third-party
requests (EU privacy rules), self-host Inter instead — it is open-licensed.

**Motion respects `prefers-reduced-motion`.** All animation is disabled for
users who have asked for that at OS level.
