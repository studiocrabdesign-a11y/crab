# CRAB Design Studio — Coming Soon

Static coming-soon page. No build step, no dependencies, no framework.
The files in this folder **are** the site — upload them as-is.

```
index.html         coming-soon page
blog.html          the Journal (blog listing + reader)
styles.css         all styling (shared by both pages)
script.js          title reveal, parallax, email form (EmailJS)
blog.js            loads + renders posts, reader overlay
blog-posts.json    starter blog content (see BLOG.md)
.nojekyll          tells GitHub Pages to serve files as-is
BLOG.md            how to add/update posts with no redeploy
assets/
  logo.png              supplied logo artwork
  hero.jpg              architectural photograph
  favicon.png           browser tab icon
  apple-touch-icon.png  iOS home-screen icon
  blog/                 demo post images
```

Total weight: ~120 KB.

> **Note:** the blog fetches `blog-posts.json` over HTTP, so it needs to be
> served (GitHub Pages, Netlify, or any web server). Opening `blog.html`
> directly from disk with `file://` will show no posts — that's a browser
> security rule, not a bug. The coming-soon `index.html` works either way.

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

## Connecting the email form (EmailJS)

The form is already wired to [EmailJS](https://www.emailjs.com). It just
needs three values pasted into the `EMAILJS` block at the top of `script.js`:

```js
var EMAILJS = {
  publicKey:  '',   // Account → General → Public Key
  serviceId:  '',   // Email Services → your inbox → Service ID
  templateId: ''    // Email Templates → template with an {{email}} field
};
```

Until all three are filled, the form falls back to saving addresses in the
browser (nothing is sent), so it never looks broken during review.

The Public Key is **meant** to live in the browser — it is not a secret. Lock
it down in EmailJS → Account → Security → enable **domain restriction** and add
`crabdesignstudio.com`, so the key can't be reused from another site.

## The blog

See **BLOG.md**. Short version: posts load at page-load from a content
source, so they can be added and edited **without any redeploy**. It ships
reading `blog-posts.json`; the recommended next step is Sanity (free) so the
client can publish from a dashboard. Full steps in BLOG.md.

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
