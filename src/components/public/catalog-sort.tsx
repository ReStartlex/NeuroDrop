"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "popular", label: "Популярные" },
  { value: "price_asc", label: "Дешевле" },
  { value: "price_desc", label: "Дороже" },
  { value: "new", label: "Новинки" },
] as const;

export function CatalogSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const value = searchParams.get("sort") ?? "popular";

  function update(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "popular") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");
    startTransition(() => router.replace(`/services?${params.toString()}`));
  }

  return (
    <Select value={value} onValueChange={update}>
      <SelectTrigger className="h-11 w-[180px]" aria-label="Сортировка">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
