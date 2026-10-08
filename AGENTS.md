# buymyvisa-blog: agent guide

`CLAUDE.md` only contains `@AGENTS.md`; this file is the single source of truth for coding agents. Keep its Schemas and Decisions sections current in the same change as the code.

The **buymyvisa travel guides**, a static Astro site served at `https://buymyvisa.com/blog/`, in its own repo, separate from the myvisa app repo. Its purpose is search traffic: costed trip guides for Indian passport holders (itinerary, budget in rupees, visa and entry rules), each linking to its destination hub, plus a pointer to the myvisa product where we file the visa (only the Thailand TDAC today). It shares no code with the app.

```
mise run setup                      # node + typos, npm dependencies
mise run dev | build | preview      # PORT env var, default 4321
mise run fmt | lint | check         # check = lint + astro check + build (what CI should run)
```
`build` needs network: it downloads every Unsplash photo once, resizes and re-encodes it (cached in `node_modules/.astro`). A transient Unsplash failure shows as `FailedToFetchRemoteImageDimensions`; re-run the build.

## Layout
| path | what |
|---|---|
| `astro.config.mjs` | `site` + `base: "/blog"`, `trailingSlash: "always"`, static output, MDX + sitemap, `image.domains` (Unsplash), self-hosted Google fonts (Newsreader, Inter, Caveat) |
| `src/content.config.ts` | the `destinations` and `guides` collections (zod schemas below) |
| `mise.toml`, `.oxlintrc.json`, `.oxfmtrc.json`, `_typos.toml` | tools and tasks |
| `src/content/destinations.json` | one entry per country: entry rules, best months, scene name |
| `src/content/guides/*.mdx` | one guide per file; the file name is the URL slug |
| `src/layouts/Base.astro` | `<head>` (SEO, fonts, time-of-day script), header, footer with the sky picker |
| `src/components/scene/` | the illustrated landscapes: `Scene` (frame), `Sky` (gradient, sun or moon, stars, clouds, birds, the `<symbol>` sprite), one layer file per destination (`Thailand`, `SriLanka`, `Vietnam`, `Iceland`) plus `Home`, and `Karst` |
| `src/lib/shapes.ts` | path builders for the art (`ridge`, `rolling`, `karst`, `karstTufts`, `mesa`, `peak`, `stars`, seeded `prng`) |
| `src/lib/seo.ts` | `href()` (base-aware links), `absolute()`, JSON-LD builders, `unsplashSrc()`, `unsplashRef()`, formatting helpers |
| `src/components/` | `Photo` (optimised Unsplash photo + credit), `GuideCard`, `FactBox`, `RouteMap`, `Faq`, `VisaCta`, `Signature`, `seo/Seo` |
| `src/pages/` | `/`, `/guides/`, `/guides/<slug>/`, `/destinations/`, `/destinations/<id>/`, `/about/`, `/404`, `/rss.xml` |
| `src/styles/` | `tokens.css` (colour tokens per time of day), `global.css` (type, layout, cards, prose), `scene.css` (scene colours, keyframes, parallax) |
| `public/` | `favicon.svg`, `apple-touch-icon.png` (180) and `logo-512.png` (the Organization logo), both rendered from the favicon; `og-default.jpg` (1200×630 social card, a capture of the home scene at dusk) |

## Schemas
Canonical: `src/content.config.ts`. Both collections are build-time only (no API).

`destinations` (file loader, `src/content/destinations.json`, array; `id` is the URL segment):
| field | type | notes |
|---|---|---|
| `id` | string | required, e.g. `"sri-lanka"` |
| `name`, `capital`, `currency`, `timezone`, `flightFromIndia`, `tagline` | string | required |
| `iso3` | string(3) | required |
| `scene` | `"thailand" \| "sri-lanka" \| "vietnam" \| "iceland"` | which illustrated scene the hub and its guides use |
| `bestMonths` | int[] (1–12) | highlighted in the facts box |
| `visa.type`, `visa.stay`, `visa.govFee`, `visa.processing` | string | required; text shown as-is |
| `visa.officialUrl` | URL | the government (or VFS) site we send readers to |
| `visa.myvisaProduct` | `"tdac-tourist"` | optional; a product code from the myvisa app (`backend/app/products.py` there), which switches on the product box |

`guides` (glob loader, `src/content/guides/*.mdx`; `id` = file name = slug):
```yaml
title: "Thailand in 6 days from India: Bangkok, Krabi & Phi Phi"   # ≤ 70 chars
description: "…"                 # 70–160 chars: the meta description and the hero lede
destination: thailand            # reference('destinations')
publishedAt: 2026-10-08
updatedAt: 2026-11-02            # optional; becomes dateModified
factsCheckedAt: 2026-10-08       # last check of the entry rules against official sources; shown in the facts box
hero:                            # an Unsplash photo
  src: "https://images.unsplash.com/photo-…"     # must be images.unsplash.com, without query
  alt: "…"                       # ≥ 10 chars, describes the scene
  photographer: "Humphrey M"
  page: "https://unsplash.com/photos/TejFa7VW5e4"   # the photo page; the credit links here
tripDays: 6
budgetInr: { low: 55000, high: 85000 }   # per person
stops:                           # ≥ 2; x 0–600, y 0–360 on the route-map canvas, placed by hand (north up)
  - { name: "Bangkok", days: "Days 1–2", x: 330, y: 80 }
faq:                             # ≥ 3; rendered as <details> and as FAQPage JSON-LD
  - { q: "…", a: "…" }
tags: ["thailand", "beaches"]
draft: false                     # optional; drafts are left out of pages, sitemap and RSS
```
In MDX bodies, `<Photo src alt photographer page caption? />` is available without an import. Wrap markdown tables in `<div class="table-scroll">` with blank lines around the table.

Structured data per page: `BlogPosting` + `BreadcrumbList` + `FAQPage` on guides, `BreadcrumbList` on hubs and indexes, `ItemList` on `/guides/`, `Organization` + `WebSite` on the home page.

## Decisions
- **Separate repo and static Astro site, not part of the myvisa app.** It is crawlable HTML with zero JS frameworks, it deploys on its own, and it can't break the app. It is served under `/blog` on the main domain (not a subdomain) so the guides build the main domain's authority. Rejected: blog pages inside the React SPA (poor for SEO).
- **Hand-written CSS, not shadcn/Tailwind** (the app's UI kit). The scenes are inline SVG coloured by CSS tokens, which a component library doesn't help with. Colours live only in `tokens.css` (plus the few fixed object colours in the scene files: lanterns, train, aurora, lighthouse).
- **Graphics:** illustrated SVG landscapes in the style of asnimansari.dev:
  - an Alto's-style sky that follows the visitor's clock (`data-theme` = dawn/day/dusk/night, set before first paint, overridable from the footer and remembered in `localStorage`);
  - Firewatch-style layered hills that move with scroll (CSS `animation-timeline: scroll()`, no JS);
  - a Polarsteps-style route map that draws itself on scroll (`view()` timeline).

  Everything animates with CSS only and stops under `prefers-reduced-motion`. One scene per page (the SVG ids aren't namespaced). The viewBox adds `sky` units above the 600-unit landscape so headlines sit in open sky, and the scene's height follows the artwork's ratio up to a per-page `max`, so wide screens don't crop it.
- **Photos:** hand-picked Unsplash photos, downloaded at build time from `images.unsplash.com` (a 1800 px JPEG via `unsplashSrc()`), re-encoded to AVIF/WebP/JPEG at several widths and served from our domain. Each photo is credited as "Photo by <name> on Unsplash", linking the photo page and Unsplash with `utm_source=buymyvisa&utm_medium=referral`. The credit links the photo page rather than the photographer's profile, because profile usernames couldn't be verified when picking. Rejected: hotlinking (slower LCP, third-party requests). Guide cards crop the hero to a fixed 3:2 at build time (`fit="cover"`, `position="attention"`, so portrait shots keep their subject) and clamp the title to 2 lines and the description to 3, so every card is the same size.
- **Facts:** every guide's entry rules are checked against the official site when written, the date goes in `factsCheckedAt` and is shown, and each guide links the official source. Where a fact comes from our own filing work (the TDAC window, VFS Iceland fees seen on 2026-10-02), it matches the myvisa repo's `visa-forms/` and `backend/app/products.py`. Update the guide when those change. Budgets are per-person, mid-range estimates in rupees.
- **Product pointer:** myvisa is B2B, so the Thailand box speaks to travel companies filing TDACs for their travellers, not to individual travellers. Other destinations only point to the official site and warn about look-alike sites.
- **SEO in the pages:**
  - `<title>` drops the " | buymyvisa travel guides" suffix when it would pass 60 characters, so long guide titles aren't cut off in search results.
  - A guide's social card is its hero, cropped to 1200×630 at build time and served from our domain.
  - Indexable pages send `max-image-preview:large`.
  - Sitemap `<lastmod>`: a guide's `updatedAt` (else `publishedAt`); hubs and indexes, the newest of their guides. It's read from the frontmatter in `astro.config.mjs`.
- **Hosting:** the shared Caddy at `/home/ubuntu/personal/caddy` (Docker, host networking) serves `dist/`. The repo is mounted at `/srv/blog`, so deploying is `mise run build`. Caddy, not this site:
  - serves `buymyvisa.com/robots.txt` with the `Sitemap:` line;
  - 301s `…/index.html` to the directory URL;
  - 301s `www` to the apex;
  - sends HSTS;
  - 302s `/` to `/blog/` until the myvisa app is hosted there.
- **Fonts** are self-hosted through Astro's fonts API (Google provider at build time), so readers make no requests to Google.
- **Tooling:** mise for node and tasks; oxlint + oxfmt (`src`, including `.astro`, `.mdx` and `.css`), `astro check` and `typos` in `mise run check`.
