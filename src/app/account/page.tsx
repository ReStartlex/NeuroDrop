import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { PriceTag } from "@/components/public/price-tag";
import { ServiceLogo } from "@/components/public/service-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import { listMyOrders } from "@/server/services/orders";

export const metadata = { title: "Личный кабинет" };

const TYPE_LABEL = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
} as const;

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const orders = user ? await listMyOrders(user.id) : [];
  const recentOrders = orders.slice(0, 5);
  const activeCount = orders.filter(
    (o) => o.status === "awaiting_payment" || o.status === "paid" || o.status === "in_progress",
  ).length;

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
          кабинет
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {user?.name ? `Привет, ${user.name}` : "Личный кабинет"}
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)]">{user?.email}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiTile label="Всего заказов" value={orders.length} icon={Sparkles} tone="accent" />
        <KpiTile label="В работе" value={activeCount} icon={MessageCircle} tone="warning" />
        <KpiTile
          label="Завершено"
          value={orders.filter((o) => o.status === "completed").length}
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Последние заказы</CardTitle>
            <CardDescription>
              Здесь видны 5 самых свежих. Полный список — в разделе «Мои заказы».
            </CardDescription>
          </div>
          {orders.length > 0 ? (
            <Button asChild variant="secondary" size="sm">
              <Link href="/account/orders">
                Все <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-[var(--color-fg-muted)]">
                Пока пусто. Начните с каталога — все 13 сервисов уже доступны.
              </p>
              <Button asChild size="md">
                <Link href="/services">
                  Открыть каталог <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-2">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-3 transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)]"
                  >
                    <ServiceLogo
                      title={order.productSnapshot.productTitle}
                      accentColor={order.productSnapshot.productAccentColor}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                          {order.productSnapshot.productTitle}
                        </span>
                        <span className="text-xs text-[var(--color-fg-subtle)]">
                          · {TYPE_LABEL[order.productSnapshot.variantType]}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="font-mono text-[10px] text-[var(--color-fg-subtle)]">
                        {order.publicId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriceTag amount={order.amountRub} size="sm" />
                      <ArrowRight className="size-3.5 text-[var(--color-fg-subtle)] transition-colors group-hover:text-[var(--color-accent)]" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Аккаунт</CardTitle>
          <CardDescription>Профиль и сессия</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-[var(--color-fg-muted)]">
            <div>{user?.email}</div>
            {user && "phone" in user && user.phone ? (
              <div className="text-xs">{String(user.phone)}</div>
            ) : null}
          </div>
          <form action="/api/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              Выйти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const TONE_CLASS = {
  accent: "text-[var(--color-accent)]",
  warning: "text-[var(--color-warning)]",
  success: "text-[var(--color-accent-emerald)]",
} as const;

function KpiTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Sparkles;
  tone: keyof typeof TONE_CLASS;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wide text-[var(--color-fg-subtle)] uppercase">
          {label}
        </span>
        <Icon className={`size-4 ${TONE_CLASS[tone]}`} />
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold text-[var(--color-fg)]">{value}</div>
    </div>
  );
}
