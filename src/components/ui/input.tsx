import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

type InputProps = ComponentProps<"input">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)]",
        "border border-[var(--color-border)] bg-[var(--color-surface)]",
        "px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]",
        "transition-colors duration-150",
        "hover:border-[var(--color-border-strong)]",
        "focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
});
