import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderAdminActions } from "@/components/admin/order-actions";
import { OrderChat } from "@/components/public/order-chat";
import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { OrderTimeline } from "@/components/public/order-timeline";
import { PriceTag } from "@/components/public/price-tag";
import { ServiceLogo } from "@/components/public/service-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import { db, schema } from "@/lib/db/client";
import { getOrderForAdmin, listOrderMessages, markMessagesRead } from "@/server/services/orders";

export const metadata: Metadata = {
  title: "Заказ — админка",
  robots: { index: false, follow: false },
};

const TYPE_LABEL = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
} as const;

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/login?next=/admin/orders/${id}`);
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "manager") redirect("/account");

  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const [user] = await db
    .select({ id: schema.users.id, email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, order.userId))
    .limit(1);

  const messages = await listOrderMessages(order.id);
  await markMessagesRead({ orderId: order.id, by: "admin" });

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg)]"
      >
        <ArrowLeft className="size-3.5" /> Все заказы
      </Link>

      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--color-border)]/60 pb-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <ServiceLogo
            title={order.productSnapshot.productTitle}
            accentColor={order.productSnapshot.productAccentColor}
            size="md"
          />
          <div>
            <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
              {order.publicId}
            </p>
            <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {order.productSnapshot.productTitle}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{TYPE_LABEL[order.productSnapshot.variantType]}</Badge>
              <Badge variant="outline">{order.productSnapshot.variantName}</Badge>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <PriceTag amount={order.amountRub} size="lg" />
          <div className="mt-1 text-xs text-[var(--color-fg-subtle)]">
            {user?.name ?? "(без имени)"} · {user?.email ?? "—"}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статус и действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <OrderTimeline order={order} />
              <OrderAdminActions order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Чат с покупателем</h2>
          <OrderChat
            orderId={order.id}
            initialMessages={messages}
            currentUserId={session.user.id}
            asAdmin
          />
        </div>
      </div>
    </div>
  );
}
