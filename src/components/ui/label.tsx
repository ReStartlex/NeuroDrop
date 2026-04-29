"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, ComponentProps<typeof LabelPrimitive.Root>>(
  function Label({ className, ...props }, ref) {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          "text-sm font-medium text-[var(--color-fg-muted)]",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
