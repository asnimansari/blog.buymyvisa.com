/** URL and structured-data helpers. Every page lives under the `/blog/` base, with a trailing slash. */

export const SITE_NAME = "buymyvisa travel guides";
export const ORG_NAME = "buymyvisa";
export const ORG_URL = "https://buymyvisa.com/";
export const DEFAULT_DESCRIPTION =
  "Honest, costed trip guides for Indian travellers: visa and entry rules, budgets in rupees, day-by-day itineraries.";

/** A site-relative link under the base: href("guides/thailand") → "/blog/guides/thailand/". */
export function href(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${base}/${clean}/` : `${base}/`;
}

/** The absolute URL of a site-relative link. */
export function absolute(path: string, site: URL | undefined): string {
  return new URL(path, site ?? ORG_URL).href;
}

/** The source we optimise from: a 1800px JPEG from Unsplash's image CDN instead of the multi-megabyte original. */
export function unsplashSrc(src: string, width = 1800): string {
  const u = new URL(src);
  u.search = "";
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", "80");
  u.searchParams.set("fm", "jpg");
  u.searchParams.set("fit", "max");
  return u.href;
}

/** Unsplash asks for these referral tags on credit links. */
export function unsplashRef(url: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "buymyvisa");
  u.searchParams.set("utm_medium", "referral");
  return u.href;
}

export const organization = {
  "@type": "Organization",
  "@id": `${ORG_URL}#org`,
  name: ORG_NAME,
  url: ORG_URL,
  logo: "https://buymyvisa.com/blog/logo-512.png",
  email: "visa@buymyvisa.com",
} as const;

export const WEBSITE_ID = "https://buymyvisa.com/blog/#website";

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Plain dates for display: "8 Oct 2026". */
export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** "Schengen short-stay visa (type C) via VFS Global" → "Schengen short-stay visa" */
export function visaName(type: string): string {
  return type.split(" (")[0] ?? type;
}
