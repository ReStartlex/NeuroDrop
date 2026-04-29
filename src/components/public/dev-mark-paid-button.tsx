"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = { orderId: string; amountRub: number };

export function DevMarkPaidButton({ orderId, amountRub }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function pay() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/dev-mark-paid`, { method: "POST" });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        toast.error(json?.error?.message ?? "Не удалось имитировать оплату");
        return;
      }
      toast.success("Оплата имитирована — заказ передан менеджеру");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Сетевая ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-[var(--color-warning)]">
        <CreditCard className="size-3.5" /> Dev-режим
      </div>
      <p className="text-sm text-[var(--color-fg-muted)]">
        В production здесь будет редирект на Lava.top. В dev можно имитировать успешную оплату
        одной кнопкой ({amountRub.toLocaleString("ru-RU")} ₽).
      </p>
      <Button onClick={pay} disabled={submitting} variant="secondary" size="sm" className="mt-3">
        {submitting ? "Имитируем…" : "Имитировать успешную оплату"}
      </Button>
    </div>
  );
}
