import { eq } from "drizzle-orm";
import { Construction } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceTag } from "@/components/public/price-tag";
import { ServiceLogo } from "@/components/public/service-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, schema } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Оформление заказа",
  robots: { index: false, follow: false },
};

const TYPE_LABEL = {
  renew: "Продление",
  ready_account: "Готовый аккаунт",
  custom: "Спецзаказ",
} as const;

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [variant] = await db
    .select()
    .from(schema.productVariants)
    .where(eq(schema.productVariants.id, id))
    .limit(1);
  if (!variant) notFound();

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, variant.productId))
    .limit(1);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
          checkout
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          Оформление заказа
        </h1>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <ServiceLogo
              title={product.title}
              accentColor={product.accentColor}
              logoUrl={product.logoUrl}
              size="md"
            />
            <div>
              <CardTitle>{product.title}</CardTitle>
              <CardDescription>{variant.name}</CardDescription>
              <div className="mt-2">
                <Badge variant={variant.type === "renew" ? "default" : "accent"}>
                  {TYPE_LABEL[variant.type]}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline justify-between border-t border-[var(--color-border)]/60 pt-4">
            <span className="text-sm text-[var(--color-fg-muted)]">К оплате</span>
            <PriceTag amount={variant.priceRub} size="lg" />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
            <div className="flex items-start gap-3">
              <Construction className="mt-0.5 size-5 shrink-0 text-[var(--color-warning)]" />
              <div>
                <p className="font-display text-sm font-semibold text-[var(--color-fg)]">
                  Оплата временно недоступна
                </p>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                  Подключение Lava.top, форм покупателя и мгновенной выдачи — в следующем релизе.
                  Каталог уже работает: можно изучить тарифы, сравнить варианты и подписаться на
                  старт.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="secondary" size="md">
              <Link href={`/services/${product.slug}`}>← К сервису</Link>
            </Button>
            <Button asChild size="md">
              <Link href="/services">Перейти в каталог</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
