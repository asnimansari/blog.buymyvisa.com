import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { DEFAULT_DESCRIPTION, SITE_NAME, href } from "../lib/seo";

export async function GET(context: APIContext) {
  const guides = (await getCollection("guides", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
  return rss({
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    site: new URL(href(), context.site ?? "https://buymyvisa.com").href,
    items: guides.map((g) => ({
      title: g.data.title,
      description: g.data.description,
      pubDate: g.data.publishedAt,
      link: href(`guides/${g.id}`),
      categories: g.data.tags,
    })),
    customData: "<language>en-in</language>",
    trailingSlash: true,
  });
}
