import { CircleCheck, CircleDashed, Clock, MessageCircle, Wallet } from "lucide-react";


import { cn } from "@/lib/utils";

import type { Order, OrderStatus } from "@/lib/db/schema";
import type { LucideIcon } from "lucide-react";

type Step = {
  id: "created" | "paid" | "in_progress" | "completed";
  title: string;
  desc: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: "created",
    title: "Заказ создан",
    desc: "Данные сохранены, ожидаем оплату.",
    icon: MessageCircle,
  },
  {
    id: "paid",
    title: "Оплачен",
    desc: "Платёж получен — заказ передан менеджеру.",
    icon: Wallet,
  },
  {
    id: "in_progress",
    title: "В работе",
    desc: "Менеджер обрабатывает заказ. Обычно до 60 минут.",
    icon: Clock,
  },
  {
    id: "completed",
    title: "Выполнен",
    desc: "Доступ выдан. Проверьте детали ниже.",
    icon: CircleCheck,
  },
];

const TERMINAL: OrderStatus[] = ["cancelled", "failed", "refunded"];

function reachedStep(current: OrderStatus, step: Step["id"]): boolean {
  if (TERMINAL.includes(current)) return false;
  const order: OrderStatus[] = ["awaiting_payment", "paid", "in_progress", "completed"];
  const currentIdx = order.indexOf(current);
  const stepIdx: Record<Step["id"], number> = {
    created: 0,
    paid: 1,
    in_progress: 2,
    completed: 3,
  };
  return currentIdx >= stepIdx[step];
}

export function OrderTimeline({ order }: { order: Order }) {
  if (TERMINAL.includes(order.status)) {
    const label =
      order.status === "cancelled"
        ? "Заказ отменён"
        : order.status === "refunded"
          ? "По заказу выполнен возврат"
          : "Заказ завершился ошибкой";
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm">
        <p className="font-medium text-[var(--color-danger)]">{label}</p>
        {order.notes ? (
          <p className="mt-1 text-[var(--color-fg-muted)]">{order.notes}</p>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="grid gap-2">
      {STEPS.map((step, idx) => {
        const reached = reachedStep(order.status, step.id);
        const Icon = reached ? CircleCheck : step.icon;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-3 rounded-[var(--radius)] border p-3 transition-colors",
              reached
                ? "border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/5"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/40",
            )}
          >
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                reached
                  ? "bg-[var(--color-accent-emerald)]/15 text-[var(--color-accent-emerald)]"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-fg-subtle)]",
              )}
            >
              {reached ? <Icon className="size-4" /> : <CircleDashed className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-[var(--color-fg)]">{step.title}</span>
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">
                  0{idx + 1}
                </span>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)]">{step.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
