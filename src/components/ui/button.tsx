import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap",
    "transition-[transform,box-shadow,background-color,border-color,color]",
    "duration-200 ease-[var(--ease-emphasized)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:translate-y-[1px]",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-strong)]",
          "shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)]",
        ].join(" "),
        secondary: [
          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]",
          "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--color-fg-muted)]",
          "hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]",
        ].join(" "),
        outline: [
          "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-fg)]",
          "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
        ].join(" "),
        danger: ["bg-[var(--color-danger)] text-white", "hover:bg-[var(--color-danger)]/90"].join(
          " ",
        ),
        link: "bg-transparent px-0 text-[var(--color-accent)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-[var(--radius)] px-3 text-sm",
        md: "h-10 rounded-[var(--radius)] px-4 text-sm",
        lg: "h-12 rounded-[var(--radius-md)] px-6 text-base",
        icon: "size-10 rounded-[var(--radius)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";
  return (
    <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});

export { buttonVariants };
export type { ButtonProps };
