import { cn } from "@/lib/utils";
import { formatRub } from "@/lib/utils";

type PriceTagProps = {
  amount: number;
  prefix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const;

export function PriceTag({ amount, prefix, size = "md", className }: PriceTagProps) {
  return (
    <span className={cn("font-mono font-semibold tracking-tight text-[var(--color-fg)]", sizeMap[size], className)}>
      {prefix ? <span className="mr-1 text-[var(--color-fg-subtle)]">{prefix}</span> : null}
      {formatRub(amount)}
    </span>
  );
}
