import { and, eq } from "drizzle-orm";
import { type MetadataRoute } from "next";

import { db, schema } from "@/lib/db/client";
import { SITE, absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contacts"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: absoluteUrl("/legal/offer"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/legal/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const products = await db
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(eq(schema.products.isActive, true));

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: absoluteUrl(`/services/${p.slug}`),
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categories = await db
      .select({ slug: schema.categories.slug })
      .from(schema.categories)
      .where(and(eq(schema.categories.isActive, true)));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: absoluteUrl(`/services?category=${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

void SITE;
