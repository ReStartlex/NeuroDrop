"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "nd-theme";
const ORDER: ThemePreference[] = ["system", "light", "dark"];

function applyTheme(pref: ThemePreference): "light" | "dark" {
  const resolved =
    pref === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : pref;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

function readSavedPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

const ICONS: Record<ThemePreference, React.ComponentType<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABELS: Record<ThemePreference, string> = {
  light: "Светлая тема",
  dark: "Тёмная тема",
  system: "Тема: как в системе",
};

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readSavedPreference();
    // One-time hydration of stored preference from localStorage. setState
    // here is intentional — required to surface the right icon after mount
    // since SSR cannot read localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init from localStorage (FOUC-safe)
    setPref(initial);
    setMounted(true);

    if (initial === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    return;
  }, []);

  function cycle() {
    const idx = ORDER.indexOf(pref);
    const next = ORDER[(idx + 1) % ORDER.length] ?? "system";
    setPref(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const Icon = ICONS[pref];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={mounted ? LABELS[pref] : "Переключить тему"}
      title={mounted ? LABELS[pref] : "Переключить тему"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[var(--radius)]",
        "border border-[var(--color-border)] bg-[var(--color-surface)]/60",
        "text-[var(--color-fg-muted)] transition-all duration-200 ease-[var(--ease-emphasized)]",
        "hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)] active:translate-y-[1px]",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/60 focus-visible:outline-none",
        className,
      )}
      suppressHydrationWarning
    >
      <Icon className="size-4" />
    </button>
  );
}
