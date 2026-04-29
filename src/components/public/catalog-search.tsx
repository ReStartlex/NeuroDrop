"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

export function CatalogSearch({ placeholder = "Поиск по сервисам…" }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [value, setValue] = useState(queryParam);
  const [trackedQuery, setTrackedQuery] = useState(queryParam);
  const [, startTransition] = useTransition();

  if (queryParam !== trackedQuery) {
    setTrackedQuery(queryParam);
    setValue(queryParam);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed === queryParam) return;
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`/services?${params.toString()}`));
    }, 300);
    return () => clearTimeout(handle);
  }, [value, queryParam, router, searchParams]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10 pr-10"
        aria-label="Поиск"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg)]"
          aria-label="Очистить поиск"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
