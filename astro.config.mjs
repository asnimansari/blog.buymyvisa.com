// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { readFileSync, readdirSync } from "node:fs";

const SITE = "https://buymyvisa.com";
const BASE = "/blog";

/**
 * Sitemap <lastmod>: a guide's updatedAt (else publishedAt); a hub, the newest of its guides; the home page and
 * indexes, the newest guide overall. Read from the frontmatter with a regex, since the config can't use collections.
 */
function lastmods() {
  /** @type {Map<string, string>} */
  const byUrl = new Map();
  const dir = new URL("./src/content/guides/", import.meta.url);
  const field = (/** @type {string} */ text, /** @type {string} */ key) =>
    text.match(new RegExp(`^${key}:\\s*["']?([^"'\\s#]+)`, "m"))?.[1];
  const newer = (/** @type {string} */ url, /** @type {string} */ date) => {
    if ((byUrl.get(url) ?? "") < date) byUrl.set(url, date);
  };
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const front = readFileSync(new URL(file, dir), "utf8").split(/^---$/m)[1] ?? "";
    const date = field(front, "updatedAt") ?? field(front, "publishedAt");
    if (!date || field(front, "draft") === "true") continue;
    newer(`${SITE}${BASE}/guides/${file.replace(/\.mdx$/, "")}/`, date);
    newer(`${SITE}${BASE}/destinations/${field(front, "destination")}/`, date);
    for (const index of ["/", "/guides/", "/destinations/"]) newer(`${SITE}${BASE}${index}`, date);
  }
  return byUrl;
}
const lastmod = lastmods();

// Served at buymyvisa.com/blog: a subpath (not a subdomain) so the blog builds the main domain's authority.
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "always",
  output: "static",
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const date = lastmod.get(item.url);
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item;
      },
    }),
  ],
  image: {
    // Unsplash photos are downloaded, resized and re-encoded at build time, then served from our domain.
    domains: ["images.unsplash.com"],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Newsreader",
      cssVariable: "--font-serif",
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-sans",
      weights: [400, 500, 600],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Caveat",
      cssVariable: "--font-hand",
      weights: [500, 600],
      subsets: ["latin"],
      fallbacks: ["cursive"],
    },
  ],
});
