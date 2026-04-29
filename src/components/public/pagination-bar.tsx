"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
};

export function PaginationBar({ page, totalPages, total, perPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    router.replace(`/services?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)]/60 pt-6">
      <p className="text-xs text-[var(--color-fg-subtle)]">
        <span className="font-mono">{first}</span>–<span className="font-mono">{last}</span> из{" "}
        <span className="font-mono text-[var(--color-fg-muted)]">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => go(page - 1)}>
          <ChevronLeft className="size-4" /> Назад
        </Button>
        <span className="font-mono text-sm text-[var(--color-fg-muted)]">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          Вперёд <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
