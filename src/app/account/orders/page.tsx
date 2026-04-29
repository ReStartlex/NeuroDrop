import { ArrowRight, Inbox } from "lucide-react";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { PriceTag } from "@/components/public/price-tag";
import { ServiceLogo } from "@/components/public/service-logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";
import { listMyOrders } from "@/server/services/orders";

export const metadata: Metadata = {
  title: "Мои заказы",
  robots: { index: false, follow: false },
};

const TYPE_LABEL = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
} as const;

export default async function MyOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/account/orders");

  const orders = await listMyOrders(session.user.id);

  return (
    <div>
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
            кабинет
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Мои заказы
          </h1>
        </div>
        <Button asChild size="md">
          <Link href="/services">
            В каталог <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      {orders.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-10 text-center">
          <Inbox className="size-8 text-[var(--color-fg-subtle)]" />
          <p className="font-display text-lg font-semibold">Пока нет заказов</p>
          <p className="max-w-sm text-sm text-[var(--color-fg-muted)]">
            Загляните в каталог — выберите подписку, оформите за пару минут, доступ выдаём в чате
            заказа.
          </p>
          <Button asChild size="md" className="mt-2">
            <Link href="/services">Открыть каталог</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4 transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)]"
              >
                <ServiceLogo
                  title={order.productSnapshot.productTitle}
                  accentColor={order.productSnapshot.productAccentColor}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-base font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                      {order.productSnapshot.productTitle}
                    </span>
                    <span className="text-xs text-[var(--color-fg-subtle)]">
                      · {TYPE_LABEL[order.productSnapshot.variantType]}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--color-fg-subtle)]">
                    <span className="font-mono">{order.publicId}</span>
                    <span>·</span>
                    <span>{order.productSnapshot.variantName}</span>
                    <span>·</span>
                    <span>
                      {new Date(order.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PriceTag amount={order.amountRub} size="md" />
                  <ArrowRight className="size-4 text-[var(--color-fg-subtle)] transition-colors group-hover:text-[var(--color-accent)]" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
