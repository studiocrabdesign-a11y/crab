# The Journal — publishing & the CMS

The blog is built so the studio can **own its content forever and publish
without touching code.** This document covers how it works and the one-time
setup.

Chosen approach: **Sveltia CMS** (a git-based editor). Every post is a
Markdown file in *this repo* — the studio owns the files outright, free, with
full version history. See "Why this one" at the end for the reasoning.

---

## How it works

```
content/posts/*.md        <- the posts (what the CMS writes; the source of truth)
scripts/build-blog.mjs     -> compiles those into blog-posts.json
blog-posts.json           <- what the site reads (regenerated automatically)
blog.html / blog.js       -> render the journal
admin/                     -> the editor (Sveltia CMS)
.github/workflows/         -> rebuilds blog-posts.json after each publish
```

1. The client opens **crabdesignstudio.com/admin/**, logs in with GitHub.
2. Writes a post, uploads a cover image, clicks **Publish**.
3. Sveltia saves a Markdown file to `content/posts/` in the repo.
4. A GitHub Action recompiles `blog-posts.json` and commits it.
5. GitHub Pages redeploys (~1 min, automatic). The post is live.

The client never sees steps 3–5. To them it's: write → Publish → done.

---

## One-time setup (developer, ~30 min)

### 1. Connect this folder to the GitHub repo
Right now the repo was populated by uploading the zip. From here on the repo
is the single source of truth — **stop uploading zips**, push with git instead.

```bash
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

### 2. Fill in `admin/config.yml`
Replace the two placeholders:
- `repo: OWNER/REPO` → e.g. `crabstudio/crabdesignstudio.com`
- `base_url:` → the auth relay URL from step 4

### 3. Create a GitHub OAuth App
GitHub → Settings → Developer settings → **OAuth Apps** → New.
- Homepage URL: `https://crabdesignstudio.com`
- Authorization callback URL: your relay's `/callback` (from step 4)

Copy the **Client ID** and **Client Secret**.

### 4. Deploy the free auth relay (keeps the secret out of the public repo)
Sveltia provides a one-click Cloudflare Worker for this. Deploy it, then set
two environment variables on the Worker: `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` from step 3. The secret lives only here, never in the
repo. Put the Worker's URL into `base_url` in `config.yml`.

> This is why a **public repo is safe**: the only secret in the whole system
> sits in the Worker's environment, not in any file anyone can read. Publishing
> still requires logging in as a GitHub user with write access to the repo.

### 5. Add the client as a repo collaborator
GitHub → repo → Settings → Collaborators → add their GitHub account with
**Write** access. That is what authorises them to publish — and the only thing
that does.

### 6. Turn on GitHub Actions + Pages
- Actions: repo → Settings → Actions → allow workflows (on by default).
- Pages: Settings → Pages → Deploy from branch `main` (already set for the site).

Done. From now on the client publishes from `/admin/` with zero developer
involvement and zero manual steps.

---

## Editing content by hand (fallback)

Posts are just Markdown. Anyone can edit `content/posts/*.md` directly in the
GitHub web editor or locally; the Action rebuilds the JSON on push. To preview
locally without the Action:

```bash
node scripts/build-blog.mjs      # regenerates blog-posts.json
```

Front-matter format:

```markdown
---
title: Your headline
category: Architecture
date: 2026-07-01
image: assets/blog/your-photo.jpg
excerpt: One or two sentences shown on the card.
---
First paragraph.

Second paragraph.
```

---

## Why this one (vs the alternatives)

| | Owns content? | Free | No manual steps for client | Images |
|---|---|---|---|---|
| **Sveltia (chosen)** | **Yes — files in own repo** | **Yes** | **Yes** | Good |
| Sanity (rented) | No — vendor-hosted | Yes | Yes | Excellent |
| Notion (rented) | No — vendor-hosted | Yes | Yes | Good |
| Google Form | No — in Drive | Yes | Yes | Weak |
| Self-hosted WordPress | Yes | No (~$5–15/mo) | Yes | Good |

Sveltia was chosen for **long-term control and ownership**: the content is
plain Markdown in the studio's own repository, so even if the editor tool
vanished, every post is still there as a readable file. Nothing to migrate,
no vendor, no cost.

The one trade-off vs a purely runtime-fetched CMS (Sanity/Notion): publishing
triggers an automatic ~1-minute site rebuild. It's invisible to the client —
one button — but it is a rebuild. For maximum ownership that's the right price.

---

## Status

Scaffolded on the **`cms` branch**. The content pipeline (Markdown → JSON) is
built and tested locally. Remaining before go-live: steps 1–6 above (they need
the GitHub repo + one OAuth app + the auth relay), then merge `cms` → `main`.
