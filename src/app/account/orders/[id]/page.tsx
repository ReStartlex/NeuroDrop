import { AlertCircle, ArrowLeft, Clock, KeyRound, MessageCircle, ShieldCheck } from "lucide-react";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DevMarkPaidButton } from "@/components/public/dev-mark-paid-button";
import { OrderChat } from "@/components/public/order-chat";
import { OrderStatusBadge } from "@/components/public/order-status-badge";
import { OrderTimeline } from "@/components/public/order-timeline";
import { PriceTag } from "@/components/public/price-tag";
import { ServiceLogo } from "@/components/public/service-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import { getMyOrder, listOrderMessages, markMessagesRead } from "@/server/services/orders";

export const metadata: Metadata = {
  title: "Заказ",
  robots: { index: false, follow: false },
};

const TYPE_LABEL = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
} as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/login?next=/account/orders/${id}`);

  const order = await getMyOrder({ orderId: id, userId: session.user.id });
  if (!order) notFound();

  const messages = await listOrderMessages(order.id);
  await markMessagesRead({ orderId: order.id, by: "user" });

  const isDev = process.env.NODE_ENV !== "production";
  const showDevPay = order.status === "awaiting_payment" && isDev;

  return (
    <div>
      <Link
        href="/account/orders"
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
        <PriceTag amount={order.amountRub} size="lg" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статус</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderTimeline order={order} />

              {showDevPay ? (
                <DevMarkPaidButton orderId={order.id} amountRub={order.amountRub} />
              ) : null}

              {order.status === "completed" && order.deliveredText ? (
                <DeliveryBlock
                  deliveredText={order.deliveredText}
                  credentialsPlaintext={order.credentialsPlaintext}
                  expiresAt={order.expiresAt}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-[var(--color-accent-emerald)]" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--color-fg-muted)]">
              <p className="flex items-start gap-2">
                <KeyRound className="mt-0.5 size-3.5 shrink-0 text-[var(--color-accent)]" />
                Чувствительные поля (логин/пароль/2FA) шифруются AES-256-GCM. Доступ — только для
                выполнения заказа, каждое раскрытие пишется в audit log.
              </p>
              {order.sensitivePurgeAt ? (
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-[var(--color-accent-indigo)]" />
                  Чувствительные данные будут удалены{" "}
                  <span className="font-mono">
                    {new Date(order.sensitivePurgeAt).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  .
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-display flex items-center gap-2 text-base font-semibold">
            <MessageCircle className="size-4 text-[var(--color-accent)]" />
            Чат с менеджером
          </h2>
          <OrderChat
            orderId={order.id}
            initialMessages={messages}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}

function DeliveryBlock({
  deliveredText,
  credentialsPlaintext,
  expiresAt,
}: {
  deliveredText: string;
  credentialsPlaintext: string | null;
  expiresAt: Date | null;
}) {
  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
        <KeyRound className="size-4" />
        Доступ выдан
      </div>
      <p className="text-sm whitespace-pre-line text-[var(--color-fg)]">{deliveredText}</p>

      {credentialsPlaintext ? (
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-3">
          <div className="mb-1 font-mono text-[10px] tracking-wider text-[var(--color-fg-subtle)] uppercase">
            Доступы
          </div>
          <pre className="font-mono text-sm break-all whitespace-pre-wrap text-[var(--color-fg)]">
            {credentialsPlaintext}
          </pre>
        </div>
      ) : null}

      {expiresAt ? (
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
          <AlertCircle className="size-3.5 text-[var(--color-warning)]" />
          Подписка действует до{" "}
          <span className="font-mono">
            {new Date(expiresAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
