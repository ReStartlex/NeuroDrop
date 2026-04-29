"use client";

import { CheckCircle2, Eye, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { Order, OrderStatus } from "@/lib/db/schema";

type Props = { order: Order };

type RevealResponse = { ok: true; data: { formData: Record<string, string> | null } };
type ActionResponse = { ok: true; data: { status: OrderStatus } };
type ErrorResponse = { ok: false; error: { code: string; message?: string } };

async function call<T>(orderId: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T | ErrorResponse;
  if (!res.ok || (json as ErrorResponse).ok === false) {
    const err = json as ErrorResponse;
    throw new Error(err.error?.message ?? err.error?.code ?? `HTTP ${res.status}`);
  }
  return json as T;
}

export function OrderAdminActions({ order }: Props) {
  const router = useRouter();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState<null | "start" | "fulfill" | "cancel">(null);

  const [deliveredText, setDeliveredText] = useState("");
  const [credentials, setCredentials] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [cancelReason, setCancelReason] = useState("");

  async function reveal() {
    setRevealing(true);
    try {
      const res = await call<RevealResponse>(order.id, { action: "reveal" });
      setRevealed(res.data.formData ?? {});
      toast.success("Данные раскрыты — действие записано в audit log");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось раскрыть данные");
    } finally {
      setRevealing(false);
    }
  }

  async function start() {
    setBusy("start");
    try {
      await call<ActionResponse>(order.id, { action: "start" });
      toast.success("Заказ переведён в работу");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  async function fulfill() {
    if (!deliveredText.trim()) {
      toast.error("Заполните текст для покупателя");
      return;
    }
    setBusy("fulfill");
    try {
      await call<ActionResponse>(order.id, {
        action: "fulfill",
        deliveredText: deliveredText.trim(),
        credentials: credentials.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      toast.success("Заказ выполнен");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (!cancelReason.trim()) {
      toast.error("Укажите причину");
      return;
    }
    setBusy("cancel");
    try {
      await call<ActionResponse>(order.id, { action: "cancel", reason: cancelReason.trim() });
      toast.success("Заказ отменён");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  const isTerminal =
    order.status === "completed" || order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="space-y-6">
      {order.formDataEncrypted ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-[var(--color-fg-subtle)] uppercase">
            Данные покупателя
          </h3>
          {revealed === null ? (
            <Button onClick={reveal} disabled={revealing} size="sm" variant="secondary">
              <Eye className="size-4" />
              {revealing ? "Раскрываем…" : "Показать данные"}
            </Button>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-3">
              <div className="mb-2 text-xs text-[var(--color-warning)]">
                Доступ записан в audit log. Не передавайте данные третьим лицам.
              </div>
              <dl className="grid gap-2 text-sm">
                {Object.entries(revealed).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-[var(--color-fg-subtle)]">{key}</dt>
                    <dd className="font-mono break-all text-[var(--color-fg)]">
                      {value || <span className="text-[var(--color-fg-subtle)]">(пусто)</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      ) : null}

      {order.status === "paid" ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-[var(--color-fg-subtle)] uppercase">
            Действия
          </h3>
          <Button onClick={start} disabled={busy === "start"}>
            <Play className="size-4" />
            Взять в работу
          </Button>
        </section>
      ) : null}

      {!isTerminal ? (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-[var(--color-fg-subtle)] uppercase">
            Выдать доступ
          </h3>
          <div className="grid gap-1.5">
            <label className="text-sm text-[var(--color-fg-muted)]">Сообщение покупателю</label>
            <textarea
              rows={3}
              value={deliveredText}
              onChange={(e) => setDeliveredText(e.target.value)}
              placeholder="Подписка активирована. Срок действия — 1 месяц…"
              className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)]"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm text-[var(--color-fg-muted)]">
              Доступы (логин/пароль) — будут зашифрованы
            </label>
            <textarea
              rows={3}
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder={"Логин: \nПароль: "}
              className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-fg)]"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm text-[var(--color-fg-muted)]">Дата окончания</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)]"
            />
          </div>
          <Button onClick={fulfill} disabled={busy === "fulfill"} size="md">
            <CheckCircle2 className="size-4" />
            {busy === "fulfill" ? "Сохраняем…" : "Завершить заказ"}
          </Button>
        </section>
      ) : null}

      {!isTerminal ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wider text-[var(--color-fg-subtle)] uppercase">
            Отмена
          </h3>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Причина отмены"
            className="h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)]"
          />
          <Button
            onClick={cancel}
            disabled={busy === "cancel"}
            variant="ghost"
            size="sm"
            className="text-[var(--color-danger)]"
          >
            <X className="size-4" /> Отменить заказ
          </Button>
        </section>
      ) : null}
    </div>
  );
}
