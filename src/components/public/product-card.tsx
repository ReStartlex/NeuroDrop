import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CursorGlowCard } from "@/components/public/cursor-glow-card";
import { PriceTag } from "@/components/public/price-tag";
import { RatingStars } from "@/components/public/rating-stars";
import { ServiceLogo } from "@/components/public/service-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { ProductListItem } from "@/server/services/catalog";

type ProductCardProps = {
  product: ProductListItem;
  variant?: "grid" | "compact";
  className?: string;
};

export function ProductCard({ product, variant = "grid", className }: ProductCardProps) {
  const { slug, title, shortDescription, accentColor, logoUrl, minPrice, hasRenew, hasReadyAccount, rating, reviewsCount, categoryName } = product;
  const href = `/services/${slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-[var(--radius)] border border-[var(--color-border)]",
          "bg-[var(--color-bg-elevated)]/60 p-3 transition-colors",
          "hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)]",
          className,
        )}
      >
        <ServiceLogo title={title} accentColor={accentColor} logoUrl={logoUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
            {title}
          </div>
          <div className="text-xs text-[var(--color-fg-subtle)]">
            от <PriceTag amount={minPrice} size="sm" />
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-[var(--color-fg-subtle)] transition-colors group-hover:text-[var(--color-accent)]" />
      </Link>
    );
  }

  return (
    <CursorGlowCard
      href={href}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-md",
        "p-5 transition-all duration-200 ease-[var(--ease-emphasized)]",
        "hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)]",
        "hover:-translate-y-0.5",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 90% -10%, ${accentColor}1f, transparent 40%)`,
      }}
    >
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <ServiceLogo title={title} accentColor={accentColor} logoUrl={logoUrl} size="md" />
        {categoryName ? (
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {categoryName}
          </Badge>
        ) : null}
      </div>

      <div className="relative z-[1] flex flex-1 flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm text-[var(--color-fg-muted)]">{shortDescription}</p>
      </div>

      <div className="relative z-[1] flex flex-wrap items-center gap-1.5">
        {hasRenew ? (
          <Badge variant="default" className="text-[10px] uppercase tracking-wide">
            Продление
          </Badge>
        ) : null}
        {hasReadyAccount ? (
          <Badge variant="accent" className="text-[10px] uppercase tracking-wide">
            Готовый аккаунт
          </Badge>
        ) : null}
        {typeof rating === "number" && reviewsCount > 0 ? (
          <RatingStars value={rating} count={reviewsCount} className="ml-auto" />
        ) : null}
      </div>

      <div className="relative z-[1] flex items-baseline justify-between border-t border-[var(--color-border)]/60 pt-4">
        <PriceTag amount={minPrice} prefix="от" size="lg" />
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-fg-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
          Подробнее
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </CursorGlowCard>
  );
}
