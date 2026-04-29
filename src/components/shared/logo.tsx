import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

type LogoProps = ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const sizeMap = {
  sm: { svg: 20, text: "text-sm" },
  md: { svg: 28, text: "text-lg" },
  lg: { svg: 40, text: "text-2xl" },
} as const;

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nd-grad" x1="6" y1="2" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="55%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      {/* drop body */}
      <path
        d="M20 4 C 14 12, 8 18, 8 26 a12 12 0 0 0 24 0 C 32 18, 26 12, 20 4 Z"
        fill="url(#nd-grad)"
        opacity="0.18"
      />
      <path
        d="M20 4 C 14 12, 8 18, 8 26 a12 12 0 0 0 24 0 C 32 18, 26 12, 20 4 Z"
        stroke="url(#nd-grad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* neural nodes */}
      <circle cx="20" cy="14" r="2" fill="url(#nd-grad)" />
      <circle cx="14" cy="22" r="1.6" fill="#22D3EE" />
      <circle cx="26" cy="22" r="1.6" fill="#818CF8" />
      <circle cx="20" cy="29" r="1.8" fill="#34D399" />
      {/* connections */}
      <path
        d="M20 14 L14 22 M20 14 L26 22 M14 22 L20 29 M26 22 L20 29 M14 22 L26 22"
        stroke="url(#nd-grad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({ className, size = "md", showWordmark = true, ...rest }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("inline-flex items-center gap-2", className)} {...rest}>
      <LogoMark size={s.svg} />
      {showWordmark && (
        <span
          className={cn("font-display font-semibold tracking-tight text-[var(--color-fg)]", s.text)}
        >
          Neuro<span className="text-gradient-accent">Drop</span>
        </span>
      )}
    </div>
  );
}
