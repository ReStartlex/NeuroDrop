"use client";

import { ArrowRight, Check, Package, Repeat, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PriceTag } from "@/components/public/price-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ProductVariant } from "@/lib/db/schema";

type Props = {
  variants: ProductVariant[];
  initialVariantId?: string | undefined;
  accentColor: string;
};

const TYPE_LABEL: Record<ProductVariant["type"], string> = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
};

const TYPE_ICON: Record<ProductVariant["type"], typeof Repeat> = {
  renew: Repeat,
  ready_account: Package,
  custom: Sparkles,
};

export function VariantSelector({ variants, initialVariantId, accentColor }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const initial = variants.find((v) => v.id === initialVariantId) ?? variants[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(initial?.id);
  const selected = variants.find((v) => v.id === selectedId) ?? initial;

  function goCheckout() {
    if (!selected) return;
    startTransition(() => router.push(`/checkout/${selected.id}`));
  }

  if (!selected) {
    return (
      <div className="surface p-6 text-sm text-[var(--color-fg-muted)]">
        Этот сервис временно недоступен.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
        Выберите тариф
      </h3>
      <div className="grid gap-2.5">
        {variants.map((v) => {
          const Icon = TYPE_ICON[v.type];
          const active = v.id === selected.id;
          const outOfStock = typeof v.stock === "number" && v.stock <= 0;
          return (
            <button
              key={v.id}
              type="button"
              disabled={outOfStock}
              onClick={() => setSelectedId(v.id)}
              className={cn(
                "group relative flex items-start gap-3 rounded-[var(--radius-md)] p-4 text-left",
                "border bg-[var(--color-surface)]/60 transition-all duration-150",
                "hover:bg-[var(--color-surface)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-[var(--color-accent)]/60 bg-[var(--color-surface)] shadow-[var(--shadow-glow-sm)]"
                  : "border-[var(--color-border)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)]",
                  active
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)]",
                )}
                aria-hidden
              >
                <Icon className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[var(--color-fg)]">{v.name}</span>
                  <PriceTag amount={v.priceRub} size="sm" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-fg-subtle)]">
                  <Badge
                    variant={v.type === "renew" ? "default" : "accent"}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {TYPE_LABEL[v.type]}
                  </Badge>
                  {v.durationDays ? (
                    <span className="font-mono">≈ {Math.round(v.durationDays / 30)} мес</span>
                  ) : null}
                  {typeof v.stock === "number" ? (
                    <span
                      className={cn(
                        "font-mono",
                        v.stock <= 0
                          ? "text-[var(--color-danger)]"
                          : v.stock <= 5
                            ? "text-[var(--color-warning)]"
                            : "text-[var(--color-fg-subtle)]",
                      )}
                    >
                      {v.stock <= 0
                        ? "нет в наличии"
                        : v.stock <= 5
                          ? `остаток: ${v.stock}`
                          : "в наличии"}
                    </span>
                  ) : null}
                </div>
              </div>

              <span
                className={cn(
                  "mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]"
                    : "border-[var(--color-border-strong)]",
                )}
                aria-hidden
              >
                {active ? <Check className="size-3" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-4"
        style={{ boxShadow: `0 0 0 1px ${accentColor}1f, 0 12px 28px -16px ${accentColor}33` }}
      >
        <div>
          <div className="text-xs text-[var(--color-fg-subtle)]">Итого</div>
          <PriceTag amount={selected.priceRub} size="lg" />
        </div>
        <Button onClick={goCheckout} size="lg" className="grow-0">
          Купить
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
