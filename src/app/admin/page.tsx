import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { PriceTag } from "@/components/public/price-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRub } from "@/lib/utils";
import { listOrdersForAdmin } from "@/server/services/orders";

export const metadata = { title: "Админ-панель" };

const SELF_EMPLOYED_LIMIT = 2_400_000;

export default async function AdminDashboardPage() {
  const { items: recent, total } = await listOrdersForAdmin({ perPage: 8 });
  const { total: awaiting } = await listOrdersForAdmin({
    status: "awaiting_payment",
    perPage: 1,
  });
  const { total: inProgress } = await listOrdersForAdmin({ status: "in_progress", perPage: 1 });
  const { total: paid } = await listOrdersForAdmin({ status: "paid", perPage: 1 });

  const ytdRevenue = recent
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.amountRub, 0);

  const kpis = [
    { title: "Заказов всего", value: String(total) },
    { title: "Ждут оплаты", value: String(awaiting) },
    { title: "В работе", value: String(paid + inProgress) },
    {
      title: "Лимит самозанятого",
      value: `${formatRub(ytdRevenue)} / ${formatRub(SELF_EMPLOYED_LIMIT)}`,
    },
  ];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Полные метрики появятся после интеграции Lava и нескольких дней работы.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader>
              <CardDescription className="text-xs tracking-wide uppercase">
                {kpi.title}
              </CardDescription>
              <CardTitle className="font-mono text-2xl">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Последние заказы</CardTitle>
            <CardDescription>Восемь самых свежих, с любым статусом</CardDescription>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/orders">
              Все заказы <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-fg-muted)]">
              Заказов ещё нет.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]/60">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--color-surface)]/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-xs text-[var(--color-fg-muted)]">
                        {order.publicId}
                      </span>
                      <span className="truncate text-sm text-[var(--color-fg)]">
                        {order.productSnapshot.productTitle}
                      </span>
                      <span className="hidden truncate text-xs text-[var(--color-fg-subtle)] md:block">
                        · {order.userEmail ?? "—"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <PriceTag amount={order.amountRub} size="sm" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
