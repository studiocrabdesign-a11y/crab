# CRAB Design Studio — Growth Roadmap

A living plan for turning the site into a ranking, brand-building asset.
Ordered by leverage. Check items off as they ship.

> **The one truth:** a coming-soon page can't rank. The biggest lever is
> building the real site (portfolio, services, about) with genuine content.
> Everything else supports that.

---

## Tier 1 — Technical SEO foundations
*Quick wins on the current static site. Mostly done — see status.*

- [x] Unique `<title>` + meta description (home, blog)
- [x] Canonical tags
- [x] Open Graph + Twitter cards (per page, absolute image URLs)
- [x] JSON-LD structured data — `ProfessionalService`/`Architect` (home), `Blog` (journal)
- [x] `robots.txt` + `sitemap.xml`
- [x] HTTPS, clean URLs, fast static pages (great Core Web Vitals)
- [ ] **Submit to Google Search Console** — verify domain, submit `sitemap.xml`
      → https://search.google.com/search-console
- [ ] **Bing Webmaster Tools** — same sitemap
- [ ] **Analytics** — add Plausible (privacy-friendly, ~1 line) or GA4
- [ ] **Fill in the address/phone** in the home JSON-LD once known
      (turns `ProfessionalService` into a true local `LocalBusiness` signal)
- [ ] Add `alt` text to every image as the portfolio grows

**Keep the sitemap current:** add a `<url>` entry whenever a new page ships.

---

## Tier 2 — The real website (the ranking unlock)
*Turn coming-soon into a full studio site. Biggest SEO + brand move.*

- [ ] **Projects / Portfolio** — each project its own page (URL like `/projects/coastal-house`)
  - Hero image → the challenge → the approach → gallery → outcome
  - Target real phrases: "concrete house {city}", "minimal interior {city}"
  - This is what earns rankings *and* wins clients
- [ ] **Services pages** — real pages for Architecture / Interiors / Design
  - (Right now those nav links go nowhere)
- [ ] **About / philosophy / team** — trust + Google E-E-A-T signals
- [ ] **Contact page** — with the guided dialogue already built
- [ ] **Individual blog post pages** — currently posts open in an overlay, so
      they share one URL. For SEO, give each post its own page/URL so Google can
      index them individually (upgrade the build step + add `BlogPosting` JSON-LD
      per post). Do this once the journal has a few real articles.

**Design notes for the build**
- Portfolio-first, image-led. Big, fast, high-quality photography is non-negotiable.
- A reusable case-study template.
- Optional: a display serif paired with Inter for editorial elegance.
- Keep the restrained motion + dark aesthetic — it's already a strong signature.

---

## Tier 3 — Local SEO
*Critical for a studio serving a geographic area.*

- [ ] **Google Business Profile** — the single biggest local lever (Maps + local pack)
- [ ] Consistent **Name / Address / Phone** everywhere it appears
- [ ] List the firm on **Houzz, Archello, Architizer, ArchDaily** (directories + backlinks)
- [ ] Local directories / chamber of commerce, if relevant
- [ ] Decide and state a **service area / city** — drives all local targeting

---

## Tier 4 — Authority & content
*Compounds over months.*

- [ ] Publish the **Journal** consistently (the CMS is ready) — cluster topics:
      materials, process, project stories
- [ ] Pitch finished projects to **Dezeen, ArchDaily, Architizer**, local press
      — each feature = authority + a backlink
- [ ] Funnel **Instagram** (`crabdesign_studio`) + **Behance** to the site
- [ ] Turn the **email list** into an occasional newsletter tied to the Journal

---

## Brand value — the steps
1. **Photography first** — the #1 brand asset for architecture. Invest here.
2. **A point of view** — the Journal is where the studio's voice is built
   (you already have one: light, concrete, restraint).
3. **Social proof** — testimonials, published/awarded projects, press badges.
4. **PR** — get featured; consistency of coverage builds reputation.
5. **Consistency** — same voice, palette, quality across site, Instagram, email.
6. **Nurture the list** — the people signing up now are your launch audience.

---

## Measurement (so we know it's working)
- Search Console: impressions, clicks, average position, indexed pages
- Analytics: visitors, top pages, referral sources
- Conversions: email signups + inquiries via the contact dialogue
- Review monthly; let data pick the next Tier-2/3 priority

---

## Suggested sequence
1. **Now:** finish Tier 1 (Search Console + analytics + address in schema)
2. **Next:** Google Business Profile + directory listings (Tier 3 — fast, high local ROI)
3. **Then:** scope and build the real site (Tier 2 — the big one)
4. **Ongoing:** Journal cadence + PR (Tier 4)
