import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius)]",
        "border border-[var(--color-border)]/40 bg-[var(--color-surface)]",
        className,
      )}
      {...props}
    />
  );
}
