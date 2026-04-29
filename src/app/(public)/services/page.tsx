import { type Metadata } from "next";

import { CatalogFilters } from "@/components/public/catalog-filters";
import { CatalogSearch } from "@/components/public/catalog-search";
import { CatalogSort } from "@/components/public/catalog-sort";
import { PaginationBar } from "@/components/public/pagination-bar";
import { ProductCard } from "@/components/public/product-card";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumb } from "@/lib/seo/jsonld";
import { listCategories, listProducts, type CatalogSort as Sort } from "@/server/services/catalog";

export const metadata: Metadata = {
  title: "Каталог зарубежных подписок · оплата картой РФ",
  description:
    "ChatGPT, Cursor, Claude, Gemini, Perplexity, Spotify, YouTube Premium и другие. Продление вашего аккаунта или готовый — выдача за минуты, оплата в рублях.",
  alternates: { canonical: "/services" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function parseSort(value: string | string[] | undefined): Sort | undefined {
  if (Array.isArray(value)) value = value[0];
  if (value === "price_asc" || value === "price_desc" || value === "new" || value === "popular")
    return value;
  return undefined;
}

function parseType(value: string | string[] | undefined): "renew" | "ready_account" | undefined {
  if (Array.isArray(value)) value = value[0];
  if (value === "renew" || value === "ready_account") return value;
  return undefined;
}

function parseInt(value: string | string[] | undefined): number | undefined {
  if (Array.isArray(value)) value = value[0];
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseStr(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = {
    q: parseStr(sp["q"]),
    categorySlug: parseStr(sp["category"]),
    type: parseType(sp["type"]),
    priceMin: parseInt(sp["priceMin"]),
    priceMax: parseInt(sp["priceMax"]),
    inStock: parseStr(sp["inStock"]) === "1",
    sort: parseSort(sp["sort"]),
    page: parseInt(sp["page"]) ?? 1,
    perPage: 12,
  };

  const [categories, result] = await Promise.all([listCategories(), listProducts(filters)]);
  const totalPages = Math.max(1, Math.ceil(result.total / result.perPage));

  const activeFilters = [
    filters.categorySlug,
    filters.type,
    filters.priceMin,
    filters.priceMax,
    filters.inStock ? "1" : undefined,
  ].filter((v) => v !== undefined && v !== null && v !== "").length;

  return (
    <>
      <section className="border-b border-[var(--color-border)]/60">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
            каталог
          </p>
          <h1 className="font-display mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            <span className="text-gradient">Все подписки.</span>{" "}
            <span className="text-gradient-accent">В рублях.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-fg-muted)] md:text-base">
            Выберите сервис и тариф. Продление вашего аккаунта или готовый — оплачиваете картой РФ
            или СБП, выдаём за минуты.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <CatalogFilters categories={categories} activeFilterCount={activeFilters} />

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:max-w-md">
                <CatalogSearch />
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
                  {result.total} {pluralize(result.total)}
                </span>
                <CatalogSort />
              </div>
            </div>

            {result.items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            <div className="mt-8">
              <PaginationBar
                page={result.page}
                totalPages={totalPages}
                total={result.total}
                perPage={result.perPage}
              />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumb([
          { name: "Главная", url: "/" },
          { name: "Каталог", url: "/services" },
        ])}
      />
    </>
  );
}

function pluralize(n: number): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "товар";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "товара";
  return "товаров";
}

function EmptyState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-10 text-center">
      <p className="font-display text-lg font-semibold text-[var(--color-fg)]">Ничего не найдено</p>
      <p className="mt-1 max-w-md text-sm text-[var(--color-fg-muted)]">
        Попробуйте изменить фильтры или сбросить поиск. Возможно, скоро появится то, что вы ищете.
      </p>
    </div>
  );
}
