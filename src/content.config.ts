import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

/** One Unsplash photo: we credit the photographer and link the photo page (Unsplash licence etiquette). */
export const photo = z.object({
  src: z.url().startsWith("https://images.unsplash.com/"),
  alt: z.string().min(10),
  photographer: z.string(),
  /** unsplash.com/photos/<id>: always resolves and links on to the photographer's profile */
  page: z.url().startsWith("https://unsplash.com/photos/"),
});

const scenes = ["thailand", "sri-lanka", "vietnam", "iceland"] as const;

const destinations = defineCollection({
  loader: file("src/content/destinations.json"),
  schema: z.object({
    name: z.string(),
    iso3: z.string().length(3),
    scene: z.enum(scenes),
    tagline: z.string(),
    capital: z.string(),
    currency: z.string(),
    timezone: z.string(),
    flightFromIndia: z.string(),
    bestMonths: z.array(z.number().int().min(1).max(12)),
    visa: z.object({
      type: z.string(),
      stay: z.string(),
      govFee: z.string(),
      processing: z.string(),
      officialUrl: z.url(),
      /** product code in backend/app/products.py, when myvisa files it */
      myvisaProduct: z.literal("tdac-tourist").optional(),
    }),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "src/content/guides" }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(70).max(160),
    destination: reference("destinations"),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** last date the visa and entry facts were checked against official sources */
    factsCheckedAt: z.coerce.date(),
    hero: photo,
    tripDays: z.number().int().positive(),
    budgetInr: z.object({ low: z.number().int(), high: z.number().int() }),
    /** itinerary stops; x/y are positions on the 600×360 route-map canvas */
    stops: z
      .array(
        z.object({
          name: z.string(),
          days: z.string(),
          x: z.number().min(0).max(600),
          y: z.number().min(0).max(360),
        }),
      )
      .min(2),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { destinations, guides };
