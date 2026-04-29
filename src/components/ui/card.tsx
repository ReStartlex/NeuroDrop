import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, ComponentProps<"div">>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)]/80 backdrop-blur-md",
        "shadow-[var(--shadow-elevated)]",
        className,
      )}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("flex flex-col gap-1.5 p-6 pb-2", className)} {...props} />;
});

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(function CardTitle(
  { className, ...props },
  ref,
) {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight text-[var(--color-fg)]", className)}
      {...props}
    />
  );
});

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p ref={ref} className={cn("text-sm text-[var(--color-fg-muted)]", className)} {...props} />
    );
  },
);

export const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />;
});

export const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
});
