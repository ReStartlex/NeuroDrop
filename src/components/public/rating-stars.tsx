import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  count?: number | undefined;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
};

export function RatingStars({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}: RatingStarsProps) {
  const filled = Math.round(value);
  const sz = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sz,
              i < filled
                ? "fill-[var(--color-warning)] text-[var(--color-warning)]"
                : "text-[var(--color-border-strong)]",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-[var(--color-fg-muted)]">
        {value.toFixed(1)}
        {showCount && typeof count === "number" ? (
          <span className="text-[var(--color-fg-subtle)]"> · {count}</span>
        ) : null}
      </span>
    </span>
  );
}
