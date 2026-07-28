# The Journal — how to add and update posts

The blog is built so the client can **publish and edit posts without ever
touching code or redeploying the site**. The page reads posts fresh every
time it loads, so a new post appears the moment it's published.

There are two ways to run it. Start on **Option 0** (works today), move to
**Option A** when the client wants to self-serve.

---

## How it works (the important idea)

`blog.html` runs `blog.js`, which **fetches the list of posts at page load**
from whatever source is configured at the top of `blog.js`:

```js
var SOURCE = {
  sanity:    { projectId: '', dataset: 'production', apiVersion: '2024-01-01' },
  localJson: 'blog-posts.json'
};
```

- If `sanity.projectId` is **blank** → it reads the bundled `blog-posts.json`.
- If `sanity.projectId` is **filled in** → it reads live from Sanity.

Because the fetch happens in the visitor's browser, **new content shows up on
the next page refresh — no GitHub commit, no rebuild, no redeploy.**

---

## Option 0 — the bundled file (works right now)

Posts live in `blog-posts.json`. To add one, add an object to the `posts`
array:

```json
{
  "title": "Your headline",
  "category": "Architecture",
  "date": "2026-07-01",
  "image": "assets/blog/your-image.jpg",
  "excerpt": "One or two sentences shown on the card.",
  "body": [
    "First paragraph.",
    "Second paragraph."
  ]
}
```

**Catch:** editing this file *is* a git commit, i.e. a deployment. Fine for
you as the developer, not what the client asked for. That's why Option A
exists. Use Option 0 as the starter content and the safety net.

---

## Option A — Sanity (recommended: free, secure, no deploys) ⭐

[Sanity](https://www.sanity.io) gives the client a proper editor (the
"Studio") in the browser: type a post, upload an image, hit **Publish**. The
website reads it live. Free tier is far more than a studio blog needs.

### One-time setup (you, ~20 minutes)

1. Install the tooling and create a project:
   ```bash
   npm create sanity@latest -- --template clean --create-project "CRAB Journal" --dataset production
   ```
   Note the **Project ID** it prints.

2. In the Studio project, define a `post` schema with these fields:
   `title` (string), `category` (string), `date` (datetime),
   `excerpt` (text), `image` (image), `body` (array of block / text).

3. Make the dataset **public-readable** (so the website can read it without a
   secret): Sanity dashboard → **API** → Datasets → set `production` to
   *Public*. This exposes **read-only** access. Writing still requires login.

4. Allow the website's domain to query the API:
   Sanity dashboard → **API** → **CORS origins** → add
   `https://crabdesignstudio.com` (and `http://localhost:8899` for testing).

5. Deploy the Studio so the client has a URL to log in to:
   ```bash
   npx sanity deploy
   ```
   Gives something like `https://crab-journal.sanity.studio`.

6. In `blog.js`, set the Project ID:
   ```js
   sanity: { projectId: 'YOUR_PROJECT_ID', dataset: 'production', apiVersion: '2024-01-01' }
   ```
   Commit that one line once. From then on, **all content changes happen in
   Sanity with zero further commits.**

### The client's day-to-day (no developer, no deploy)

1. Go to the Studio URL, log in.
2. **Create** → Post → fill in fields, upload image → **Publish**.
3. Refresh `crabdesignstudio.com/blog.html` — the post is live.

Editing or deleting a post is the same: change it in the Studio, refresh.

### Why this is secure

- The website only ever **reads** through the public API. There is no
  password, token, or write key in the site's code — nothing to steal.
- **Publishing requires logging in** to Sanity. Only invited accounts can
  write. A stranger reading your `blog.js` can see the project ID (harmless,
  it's read-only) but cannot post anything.
- CORS limits API queries to your domain.

---

## Option B — Google Sheets (simplest, if Sanity feels heavy)

If the client would rather type into a spreadsheet:

1. Make a Google Sheet with columns:
   `title, category, date, image, excerpt, body`.
2. File → Share → **Publish to web**.
3. Read it as JSON via a free proxy such as
   [`opensheet`](https://github.com/benborgers/opensheet):
   `https://opensheet.elk.sh/SHEET_ID/Sheet1`
4. Point `blog.js` at that URL (swap the fetch source — I can wire this if you
   choose it).

**Trade-offs:** dead simple to edit, but images must be hosted somewhere
(paste a URL — Google Drive links are awkward), and the `body` becomes one
long cell. Good for text-light updates, weaker for image-rich posts. For an
architecture studio that lives on imagery, **Sanity is the better fit.**

---

## My recommendation

Ship on **Option 0** now (already done — three demo posts are live). Set up
**Option A (Sanity)** before handover so the client can publish on their own.
It's the only one of these that is genuinely free, needs no redeploys, keeps
zero secrets in the frontend, and handles images the way a design studio
needs.

Want me to scaffold the Sanity schema files so setup is copy-paste? Say the
word.
