import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

import { db, schema } from "@/lib/db/client";

import type { Category, Product, ProductVariant, Review } from "@/lib/db/schema";

export type CatalogSort = "popular" | "price_asc" | "price_desc" | "new";

export type CatalogFilters = {
  q?: string | undefined;
  categorySlug?: string | undefined;
  type?: "renew" | "ready_account" | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  inStock?: boolean | undefined;
  sort?: CatalogSort | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
};

export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "title" | "shortDescription" | "accentColor" | "logoUrl" | "isFeatured"
> & {
  categorySlug: string | null;
  categoryName: string | null;
  minPrice: number;
  maxPrice: number;
  variantsCount: number;
  rating: number | null;
  reviewsCount: number;
  hasReadyAccount: boolean;
  hasRenew: boolean;
};

export async function listCategories(): Promise<Category[]> {
  return db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.isActive, true))
    .orderBy(asc(schema.categories.sortOrder));
}

const baseProductFilter = () =>
  and(
    eq(schema.products.isActive, true),
    exists(
      db
        .select({ one: sql`1` })
        .from(schema.productVariants)
        .where(
          and(
            eq(schema.productVariants.productId, schema.products.id),
            eq(schema.productVariants.isActive, true),
          ),
        ),
    ),
  );

export async function listProducts(filters: CatalogFilters = {}): Promise<{
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
}> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const perPage = Math.min(48, Math.max(1, Math.floor(filters.perPage ?? 12)));
  const offset = (page - 1) * perPage;

  const where = [baseProductFilter()];

  if (filters.q && filters.q.trim().length > 0) {
    const pattern = `%${filters.q.trim()}%`;
    where.push(
      or(ilike(schema.products.title, pattern), ilike(schema.products.shortDescription, pattern))!,
    );
  }

  if (filters.categorySlug) {
    where.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.categories)
          .where(
            and(
              eq(schema.categories.id, schema.products.categoryId),
              eq(schema.categories.slug, filters.categorySlug),
            ),
          ),
      ),
    );
  }

  if (filters.type) {
    where.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.productVariants)
          .where(
            and(
              eq(schema.productVariants.productId, schema.products.id),
              eq(schema.productVariants.isActive, true),
              eq(schema.productVariants.type, filters.type),
            ),
          ),
      ),
    );
  }

  if (typeof filters.priceMin === "number") {
    where.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.productVariants)
          .where(
            and(
              eq(schema.productVariants.productId, schema.products.id),
              eq(schema.productVariants.isActive, true),
              gte(schema.productVariants.priceRub, filters.priceMin),
            ),
          ),
      ),
    );
  }
  if (typeof filters.priceMax === "number") {
    where.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.productVariants)
          .where(
            and(
              eq(schema.productVariants.productId, schema.products.id),
              eq(schema.productVariants.isActive, true),
              lte(schema.productVariants.priceRub, filters.priceMax),
            ),
          ),
      ),
    );
  }

  if (filters.inStock) {
    where.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.productVariants)
          .where(
            and(
              eq(schema.productVariants.productId, schema.products.id),
              eq(schema.productVariants.isActive, true),
              or(
                sql`${schema.productVariants.stock} IS NULL`,
                sql`${schema.productVariants.stock} > 0`,
              )!,
            ),
          ),
      ),
    );
  }

  const composedWhere = and(...where);

  const minPriceSql = sql<number>`(
    SELECT MIN(${schema.productVariants.priceRub})
    FROM ${schema.productVariants}
    WHERE ${schema.productVariants.productId} = ${schema.products.id}
      AND ${schema.productVariants.isActive} = true
  )`.as("min_price");

  const maxPriceSql = sql<number>`(
    SELECT MAX(${schema.productVariants.priceRub})
    FROM ${schema.productVariants}
    WHERE ${schema.productVariants.productId} = ${schema.products.id}
      AND ${schema.productVariants.isActive} = true
  )`.as("max_price");

  const variantsCountSql = sql<number>`(
    SELECT COUNT(*)::int
    FROM ${schema.productVariants}
    WHERE ${schema.productVariants.productId} = ${schema.products.id}
      AND ${schema.productVariants.isActive} = true
  )`.as("variants_count");

  const ratingSql = sql<number | null>`(
    SELECT ROUND(AVG(${schema.reviews.rating})::numeric, 2)::float
    FROM ${schema.reviews}
    WHERE ${schema.reviews.productId} = ${schema.products.id}
      AND ${schema.reviews.status} = 'approved'
  )`.as("avg_rating");

  const reviewsCountSql = sql<number>`(
    SELECT COUNT(*)::int
    FROM ${schema.reviews}
    WHERE ${schema.reviews.productId} = ${schema.products.id}
      AND ${schema.reviews.status} = 'approved'
  )`.as("reviews_count");

  const hasReadySql = sql<boolean>`EXISTS(
    SELECT 1 FROM ${schema.productVariants}
    WHERE ${schema.productVariants.productId} = ${schema.products.id}
      AND ${schema.productVariants.isActive} = true
      AND ${schema.productVariants.type} = 'ready_account'
  )`.as("has_ready");

  const hasRenewSql = sql<boolean>`EXISTS(
    SELECT 1 FROM ${schema.productVariants}
    WHERE ${schema.productVariants.productId} = ${schema.products.id}
      AND ${schema.productVariants.isActive} = true
      AND ${schema.productVariants.type} = 'renew'
  )`.as("has_renew");

  const sortColumn = (() => {
    switch (filters.sort) {
      case "price_asc":
        return asc(minPriceSql);
      case "price_desc":
        return desc(minPriceSql);
      case "new":
        return desc(schema.products.createdAt);
      case "popular":
      default:
        return asc(schema.products.sortOrder);
    }
  })();

  const items = await db
    .select({
      id: schema.products.id,
      slug: schema.products.slug,
      title: schema.products.title,
      shortDescription: schema.products.shortDescription,
      accentColor: schema.products.accentColor,
      logoUrl: schema.products.logoUrl,
      isFeatured: schema.products.isFeatured,
      categorySlug: schema.categories.slug,
      categoryName: schema.categories.name,
      minPrice: minPriceSql,
      maxPrice: maxPriceSql,
      variantsCount: variantsCountSql,
      rating: ratingSql,
      reviewsCount: reviewsCountSql,
      hasReadyAccount: hasReadySql,
      hasRenew: hasRenewSql,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
    .where(composedWhere)
    .orderBy(sortColumn, asc(schema.products.id))
    .limit(perPage)
    .offset(offset);

  const [totalRow] = await db.select({ total: count() }).from(schema.products).where(composedWhere);

  return {
    items: items as ProductListItem[],
    total: totalRow?.total ?? 0,
    page,
    perPage,
  };
}

export async function listFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const { items } = await listProducts({ perPage: limit, sort: "popular" });
  const featured = items.filter((i) => i.isFeatured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return items.slice(0, limit);
}

/* -------------------------------------------------------------------------
 * Single product
 * ------------------------------------------------------------------------- */

export type ProductDetail = Product & {
  category: Category | null;
  variants: ProductVariant[];
  reviews: Review[];
  rating: number | null;
  reviewsCount: number;
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [productRow] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), eq(schema.products.isActive, true)))
    .limit(1);
  if (!productRow) return null;

  const [categoryRow] = productRow.categoryId
    ? await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, productRow.categoryId))
        .limit(1)
    : [null];

  const variants = await db
    .select()
    .from(schema.productVariants)
    .where(
      and(
        eq(schema.productVariants.productId, productRow.id),
        eq(schema.productVariants.isActive, true),
      ),
    )
    .orderBy(asc(schema.productVariants.sortOrder));

  const productReviews = await db
    .select()
    .from(schema.reviews)
    .where(and(eq(schema.reviews.productId, productRow.id), eq(schema.reviews.status, "approved")))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(20);

  const ratingValues = productReviews.map((r) => r.rating);
  const rating =
    ratingValues.length === 0
      ? null
      : Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10;

  return {
    ...productRow,
    category: categoryRow ?? null,
    variants,
    reviews: productReviews,
    rating,
    reviewsCount: productReviews.length,
  };
}

export async function listSimilarProducts(args: {
  productId: string;
  categoryId: string | null;
  limit?: number;
}): Promise<ProductListItem[]> {
  if (!args.categoryId) return [];

  const ids = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(
      and(
        eq(schema.products.isActive, true),
        eq(schema.products.categoryId, args.categoryId),
        ne(schema.products.id, args.productId),
      ),
    )
    .orderBy(asc(schema.products.sortOrder))
    .limit(args.limit ?? 4);

  if (ids.length === 0) return [];

  const { items } = await listProducts({ perPage: 48 });
  const idSet = new Set(ids.map((r) => r.id));
  return items.filter((i) => idSet.has(i.id));
}

export async function listAllProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: schema.products.slug })
    .from(schema.products)
    .where(and(eq(schema.products.isActive, true), isNotNull(schema.products.slug)));
  return rows.map((r) => r.slug);
}

void inArray;
