import { cn } from "@/lib/utils";

type ServiceCoverProps = {
  slug: string;
  title: string;
  accentColor?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Cover banner for a product. Looks for /services/{slug}-cover.{avif,webp}.
 * Falls back to a tinted gradient if no asset is available — set
 * `accentColor` to the product accent and the gradient inherits the brand
 * vibe.
 */
export function ServiceCover({
  slug,
  title,
  accentColor = "#22D3EE",
  className,
  priority,
}: ServiceCoverProps) {
  const avif = `/services/${slug}-cover.avif`;
  const webp = `/services/${slug}-cover.webp`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)]",
        "border border-[var(--color-border)]",
        "aspect-[16/9] w-full",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${accentColor}26 0%, transparent 60%), var(--color-surface)`,
      }}
    >
      <picture>
        <source srcSet={avif} type="image/avif" />
        <source srcSet={webp} type="image/webp" />
        <img
          src={webp}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>

      {/* Soft fade-out at the bottom so the title can sit on top elegantly.
          Uses --color-bg via color-mix so it adapts to both themes. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--color-bg) 55%, transparent) 70%, color-mix(in oklab, var(--color-bg) 85%, transparent) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
