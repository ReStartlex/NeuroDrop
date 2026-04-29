"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<HTMLDivElement, ComponentProps<typeof TabsPrimitive.List>>(
  function TabsList({ className, ...props }, ref) {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-[var(--radius)]",
          "border border-[var(--color-border)] bg-[var(--color-surface)] p-1",
          className,
        )}
        {...props}
      />
    );
  },
);

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium",
        "text-[var(--color-fg-muted)] transition-colors",
        "hover:text-[var(--color-fg)]",
        "data-[state=active]:bg-[var(--color-bg-elevated)] data-[state=active]:text-[var(--color-fg)]",
        "data-[state=active]:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef<HTMLDivElement, ComponentProps<typeof TabsPrimitive.Content>>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          "mt-4 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
          className,
        )}
        {...props}
      />
    );
  },
);
