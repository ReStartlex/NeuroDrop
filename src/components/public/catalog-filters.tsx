"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { Category } from "@/lib/db/schema";

type Props = {
  categories: Category[];
  activeFilterCount: number;
};

const TYPE_OPTIONS = [
  { value: "renew", label: "Продление" },
  { value: "ready_account", label: "Готовый аккаунт" },
] as const;

export function CatalogFilters({ categories, activeFilterCount }: Props) {
  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <FiltersInner categories={categories} layout="sidebar" />
        </div>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="md" className="lg:hidden">
            <SlidersHorizontal className="size-4" />
            Фильтры
            {activeFilterCount > 0 ? (
              <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-semibold text-[var(--color-on-accent)]">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Фильтры</SheetTitle>
            <SheetDescription>Настройте поиск под себя.</SheetDescription>
          </SheetHeader>
          <FiltersInner categories={categories} layout="sheet" />
        </SheetContent>
      </Sheet>
    </>
  );
}

function FiltersInner({
  categories,
  layout,
}: {
  categories: Category[];
  layout: "sidebar" | "sheet";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = searchParams.get("category");
  const activeType = searchParams.get("type");
  const inStock = searchParams.get("inStock") === "1";
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";

  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => router.replace(`/services?${params.toString()}`));
  }

  function clearAll() {
    setLocalMin("");
    setLocalMax("");
    const params = new URLSearchParams(searchParams.toString());
    ["category", "type", "inStock", "priceMin", "priceMax"].forEach((k) => params.delete(k));
    params.delete("page");
    startTransition(() => router.replace(`/services?${params.toString()}`));
  }

  return (
    <div className={cn("flex flex-col gap-6", layout === "sidebar" && "p-1")}>
      {/* Categories */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Категории
        </h4>
        <div className="grid gap-1.5">
          <FilterPill
            active={!activeCategory}
            onClick={() => updateParam("category", null)}
            label="Все"
          />
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              active={activeCategory === c.slug}
              onClick={() => updateParam("category", c.slug)}
              label={c.name}
            />
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Тип
        </h4>
        <div className="grid gap-1.5">
          <FilterPill
            active={!activeType}
            onClick={() => updateParam("type", null)}
            label="Любой"
          />
          {TYPE_OPTIONS.map((t) => (
            <FilterPill
              key={t.value}
              active={activeType === t.value}
              onClick={() => updateParam("type", t.value)}
              label={t.label}
            />
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Цена, ₽
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={(e) => updateParam("priceMin", e.target.value)}
            placeholder="от"
            className="h-9 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-visible:border-[var(--color-accent)] focus-visible:outline-none"
          />
          <span className="text-[var(--color-fg-subtle)]">—</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={(e) => updateParam("priceMax", e.target.value)}
            placeholder="до"
            className="h-9 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-visible:border-[var(--color-accent)] focus-visible:outline-none"
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Дополнительно
        </h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParam("inStock", e.target.checked ? "1" : null)}
            className="size-4 rounded border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
          />
          Только в наличии
        </label>
      </section>

      <Button variant="ghost" size="sm" className="self-start" onClick={clearAll}>
        Сбросить фильтры
      </Button>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-[var(--radius)] px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]",
      )}
    >
      {label}
      {active && (
        <span className="size-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
      )}
    </button>
  );
}
