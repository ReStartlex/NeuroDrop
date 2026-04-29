"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A card-shell that tracks the cursor position via CSS custom properties
 * (--mx, --my) and pairs with the .glow-on-hover utility in globals.css to
 * produce a soft radial highlight that follows the pointer.
 *
 * Renders as <Link> so it stays a single hit target & avoids nested anchors.
 */
type CursorGlowCardProps = {
  href: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  ariaLabel?: string;
};

export function CursorGlowCard({
  href,
  className,
  children,
  style,
  ariaLabel,
}: CursorGlowCardProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    node.style.setProperty("--mx", `${x}%`);
    node.style.setProperty("--my", `${y}%`);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      className={cn("glow-on-hover", className)}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
