import { ArrowRight, MessageCircle } from "lucide-react";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { PriceTag } from "@/components/public/price-tag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import { listOrdersForAdmin } from "@/server/services/orders";

import type { OrderStatus } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Заказы — админка",
  robots: { index: false, follow: false },
};

const STATUS_FILTERS: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "awaiting_payment", label: "Ожидают оплаты" },
  { value: "paid", label: "Оплачены" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Выполнены" },
  { value: "cancelled", label: "Отменены" },
  { value: "failed", label: "Ошибка" },
];

const VALID: ReadonlyArray<OrderStatus> = [
  "awaiting_payment",
  "paid",
  "in_progress",
  "completed",
  "cancelled",
  "failed",
  "refunded",
];

function parseStatus(value: string | string[] | undefined): OrderStatus | undefined {
  if (Array.isArray(value)) value = value[0];
  if (value && (VALID as readonly string[]).includes(value)) return value as OrderStatus;
  return undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; q?: string | string[]; page?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/admin/orders");
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "manager") redirect("/account");

  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;

  const { items, total, perPage } = await listOrdersForAdmin({
    ...(status ? { status } : {}),
    ...(q.length > 0 ? { q } : {}),
    page,
    perPage: 25,
  });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Заказы</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Всего: <span className="font-mono">{total}</span>
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const active = (filter.value === "all" && !status) || filter.value === status;
          const params = new URLSearchParams();
          if (filter.value !== "all") params.set("status", filter.value);
          if (q) params.set("q", q);
          const href = `/admin/orders${params.toString() ? `?${params.toString()}` : ""}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={
                "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                (active
                  ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]/60 text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/30")
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-fg-muted)]">
              Нет заказов под этим фильтром.
            </p>
          ) : (
            <div className="-mx-3 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs tracking-wider text-[var(--color-fg-subtle)] uppercase">
                    <th className="px-3 py-2 font-medium">ID</th>
                    <th className="px-3 py-2 font-medium">Покупатель</th>
                    <th className="px-3 py-2 font-medium">Сервис</th>
                    <th className="px-3 py-2 font-medium">Сумма</th>
                    <th className="px-3 py-2 font-medium">Статус</th>
                    <th className="px-3 py-2 font-medium">Создан</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--color-border)]/60 transition-colors hover:bg-[var(--color-surface)]/40"
                    >
                      <td className="px-3 py-3 font-mono text-xs">{order.publicId}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--color-fg)]">
                          {order.userName ?? "—"}
                        </div>
                        <div className="text-xs text-[var(--color-fg-subtle)]">
                          {order.userEmail ?? "—"}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--color-fg)]">
                          {order.productSnapshot.productTitle}
                        </div>
                        <div className="text-xs text-[var(--color-fg-subtle)]">
                          {order.productSnapshot.variantName}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <PriceTag amount={order.amountRub} size="sm" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <OrderStatusBadge status={order.status} />
                          {order.unreadFromUser > 0 ? (
                            <Badge variant="warning" className="font-mono">
                              <MessageCircle className="size-3" />
                              {order.unreadFromUser}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-[var(--color-fg-muted)]">
                        {new Date(order.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                        >
                          Открыть <ArrowRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-fg-subtle)]">
            Стр. <span className="font-mono">{page}</span> из{" "}
            <span className="font-mono">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(page - 1) }).toString()}`}
                className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/30"
              >
                ← Назад
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(page + 1) }).toString()}`}
                className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/30"
              >
                Вперёд →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
