// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Served at buymyvisa.com/blog: a subpath (not a subdomain) so the blog builds the main domain's authority.
export default defineConfig({
  site: "https://buymyvisa.com",
  base: "/blog",
  trailingSlash: "always",
  output: "static",
  integrations: [mdx(), sitemap()],
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
