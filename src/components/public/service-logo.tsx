import { cn } from "@/lib/utils";

type ServiceLogoProps = {
  title: string;
  accentColor?: string;
  logoUrl?: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "size-9 text-sm",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
} as const;

function initials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

export function ServiceLogo({
  title,
  accentColor = "#22D3EE",
  logoUrl,
  size = "md",
  className,
}: ServiceLogoProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logo URLs come from arbitrary external CDNs; switch to next/image once we self-host SVGs in Selectel Object Storage (Phase 2)
      <img
        src={logoUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        className={cn(
          "rounded-[var(--radius-md)] border border-[var(--color-border)] object-cover",
          sizeMap[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={title}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-[var(--radius-md)] border border-[var(--color-border)]",
        "font-display font-semibold tracking-tight",
        sizeMap[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${accentColor}26 0%, transparent 70%)`,
        boxShadow: `inset 0 0 0 1px ${accentColor}33`,
      }}
    >
      <span
        className="relative z-10"
        style={{ color: accentColor, textShadow: `0 0 24px ${accentColor}66` }}
      >
        {initials(title)}
      </span>
      <span
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${accentColor}55, transparent 60%)`,
        }}
        aria-hidden
      />
    </div>
  );
}
