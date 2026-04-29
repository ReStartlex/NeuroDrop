import { eq } from "drizzle-orm";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/public/checkout-form";
import { ServiceLogo } from "@/components/public/service-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
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

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${id}`)}`);
  }

  const [variant] = await db
    .select()
    .from(schema.productVariants)
    .where(eq(schema.productVariants.id, id))
    .limit(1);
  if (!variant) {
    return <NotFoundShell title="Тариф не найден" />;
  }
  if (!variant.isActive) {
    return <NotFoundShell title="Этот тариф временно отключён" />;
  }

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, variant.productId))
    .limit(1);
  if (!product) {
    return <NotFoundShell title="Сервис не найден" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-6">
        <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
          checkout
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Оформление заказа
        </h1>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Заполните данные для исполнения. Мы шифруем чувствительные поля и удаляем их через 30 дней
          после выполнения.
        </p>
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
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={variant.type === "renew" ? "default" : "accent"}>
                  {TYPE_LABEL[variant.type]}
                </Badge>
                {variant.durationDays ? (
                  <Badge variant="outline">≈ {Math.round(variant.durationDays / 30)} мес</Badge>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            variantId={variant.id}
            formSchema={variant.formSchema}
            amountRub={variant.priceRub}
          />
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-sm">
        <Link
          href={`/services/${product.slug}`}
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
        >
          ← Вернуться к сервису
        </Link>
      </div>
    </div>
  );
}

function NotFoundShell({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <Link
        href="/services"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
      >
        Вернуться в каталог →
      </Link>
    </div>
  );
}
