import { CheckCircle2, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/public/product-card";
import { RatingStars } from "@/components/public/rating-stars";
import { ServiceLogo } from "@/components/public/service-logo";
import { VariantSelector } from "@/components/public/variant-selector";
import { JsonLd } from "@/components/shared/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { breadcrumb, faqPage, product as productJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/seo/site";
import { getProductBySlug, listSimilarProducts } from "@/server/services/catalog";

type Params = { slug: string };

const COMMON_FAQ = [
  {
    question: "Это легально?",
    answer:
      "Мы посредники: помогаем оплатить зарубежную подписку с российской карты. Сама подписка — официальная, на серверах сервиса (OpenAI, Google, Anthropic и т.д.). Никаких пиратских ключей.",
  },
  {
    question: "Как происходит «продление»?",
    answer:
      "Вы оставляете логин/пароль через зашифрованную форму. Мы продлеваем подписку на вашем аккаунте и удаляем данные через 30 дней после выполнения. Доступ к расшифрованным данным пишется в audit log.",
  },
  {
    question: "А «готовый аккаунт»?",
    answer:
      "Это новый аккаунт с уже активной подпиской — мы передаём вам логин и пароль. Можете менять пароль/email после получения. Гарантия замены при блокировке.",
  },
  {
    question: "Как происходит оплата?",
    answer:
      "Через Lava.top. Принимаем карты РФ (Мир, МИР+UnionPay), СБП. Чек ФНС автоматически уходит в «Мой налог». На запуске также подключим криптоплатежи.",
  },
  {
    question: "Что если не сработает?",
    answer:
      "Если по нашей вине доступ не работает — заменим аккаунт или вернём деньги. Связь с поддержкой — через личный кабинет или Telegram.",
  },
];

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductBySlug(slug);
  if (!detail) return { title: "Услуга не найдена" };

  const title = detail.metaTitle ?? `Купить ${detail.title} в России — оплата картой РФ`;
  const description =
    detail.metaDescription ??
    `${detail.title}: продление вашего аккаунта или готовый. Оплата в рублях, выдача за минуты, гарантия замены. ${detail.shortDescription}`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${detail.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/services/${detail.slug}`),
      images: detail.ogImageUrl ? [{ url: detail.ogImageUrl }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const detail = await getProductBySlug(slug);
  if (!detail) notFound();

  const minPrice = detail.variants.reduce(
    (min, v) => (v.priceRub < min ? v.priceRub : min),
    Number.POSITIVE_INFINITY,
  );
  const maxPrice = detail.variants.reduce((max, v) => (v.priceRub > max ? v.priceRub : max), 0);

  const similar = await listSimilarProducts({
    productId: detail.id,
    categoryId: detail.categoryId,
    limit: 4,
  });

  const productLd = productJsonLd({
    name: detail.title,
    slug: detail.slug,
    description: detail.shortDescription,
    brand: detail.title,
    offers: detail.variants.map((v) => ({
      price: v.priceRub,
      url: `/services/${detail.slug}?variant=${v.id}`,
      name: v.name,
      availability:
        typeof v.stock === "number" && v.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    })),
    ...(detail.rating
      ? { rating: { ratingValue: detail.rating, reviewCount: detail.reviewsCount } }
      : {}),
    reviews: detail.reviews.slice(0, 5).map((r) => ({
      authorName: r.authorName ?? "Покупатель",
      rating: r.rating,
      reviewBody: r.text,
      datePublished: r.createdAt.toISOString(),
    })),
  });

  const faqLd = faqPage(COMMON_FAQ);
  const breadcrumbLd = breadcrumb([
    { name: "Главная", url: "/" },
    { name: "Каталог", url: "/services" },
    { name: detail.title, url: `/services/${detail.slug}` },
  ]);

  return (
    <>
      <article className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <nav
          className="mb-6 flex items-center gap-1.5 text-xs text-[var(--color-fg-subtle)]"
          aria-label="Хлебные крошки"
        >
          <Link href="/" className="hover:text-[var(--color-fg)]">
            Главная
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[var(--color-fg)]">
            Каталог
          </Link>
          {detail.category ? (
            <>
              <span>/</span>
              <Link
                href={`/services?category=${detail.category.slug}`}
                className="hover:text-[var(--color-fg)]"
              >
                {detail.category.name}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-[var(--color-fg-muted)]">{detail.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <header className="space-y-6">
            <div className="flex items-start gap-5">
              <ServiceLogo
                title={detail.title}
                accentColor={detail.accentColor}
                logoUrl={detail.logoUrl}
                size="lg"
              />
              <div>
                <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
                  {detail.category?.name ?? "сервис"}
                </p>
                <h1 className="font-display mt-1 text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
                  Купить {detail.title} в России
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {detail.rating ? (
                    <RatingStars value={detail.rating} count={detail.reviewsCount} size="md" />
                  ) : (
                    <span className="text-xs text-[var(--color-fg-subtle)]">
                      Отзывы появятся после первых заказов
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-fg-subtle)]">
                    от <span className="font-mono text-[var(--color-fg-muted)]">{minPrice}₽</span>
                    {minPrice !== maxPrice ? (
                      <>
                        {" "}
                        до{" "}
                        <span className="font-mono text-[var(--color-fg-muted)]">{maxPrice}₽</span>
                      </>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>

            <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
              {detail.shortDescription}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Feature icon={Zap} text="Выдача за минуты" />
              <Feature icon={ShieldCheck} text="Гарантия замены" />
              <Feature icon={MessageCircle} text="Поддержка 24/7" />
              <Feature icon={CheckCircle2} text="Оплата в ₽" />
            </div>

            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">Описание</TabsTrigger>
                <TabsTrigger value="how">Как это работает</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="reviews">
                  Отзывы{detail.reviewsCount ? ` · ${detail.reviewsCount}` : ""}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line text-[var(--color-fg-muted)]">
                  {detail.fullDescription ?? detail.shortDescription}
                </p>
              </TabsContent>

              <TabsContent value="how">
                <ol className="grid gap-4 text-sm text-[var(--color-fg-muted)]">
                  <Step
                    n={1}
                    title="Выберите тариф"
                    text="Продление вашего аккаунта или готовый. Цена пересчитывается мгновенно."
                  />
                  <Step
                    n={2}
                    title="Оплатите в рублях"
                    text="Картой РФ или СБП через Lava.top. Чек ФНС придёт автоматически."
                  />
                  <Step
                    n={3}
                    title="Получите доступ"
                    text="Готовый аккаунт — за минуты. Продление — после ручной проверки оператором, обычно до часа."
                  />
                  <Step
                    n={4}
                    title="Поддержка на связи"
                    text="Чат в личном кабинете и Telegram-бот. Гарантия замены при любых проблемах."
                  />
                </ol>
              </TabsContent>

              <TabsContent value="faq">
                <Accordion type="single" collapsible>
                  {COMMON_FAQ.map((q) => (
                    <AccordionItem key={q.question} value={q.question}>
                      <AccordionTrigger>{q.question}</AccordionTrigger>
                      <AccordionContent>{q.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-3">
                {detail.reviews.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    Пока нет отзывов. Оставьте свой после первого заказа.
                  </p>
                ) : (
                  detail.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-medium text-[var(--color-fg)]">
                          {r.authorName ?? "Покупатель"}
                        </div>
                        <RatingStars value={r.rating} showCount={false} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{r.text}</p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </header>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="surface-elevated p-5 md:p-6">
              <VariantSelector variants={detail.variants} accentColor={detail.accentColor} />
              <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-fg-subtle)]">
                Покупая, вы соглашаетесь с{" "}
                <Link
                  href="/legal/offer"
                  className="text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
                >
                  публичной офертой
                </Link>{" "}
                и{" "}
                <Link
                  href="/legal/privacy"
                  className="text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
                >
                  политикой конфиденциальности
                </Link>
                . Чувствительные данные шифруются и удаляются через 30 дней после выполнения заказа.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 ? (
          <section className="mt-16 border-t border-[var(--color-border)]/60 pt-10">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Похожие сервисы
              </h2>
              <Link
                href={`/services${detail.category ? `?category=${detail.category.slug}` : ""}`}
                className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
              >
                Все
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <JsonLd data={[productLd, faqLd, breadcrumbLd]} />

      {/* Sticky bottom CTA on mobile */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[var(--color-bg)] to-transparent pt-12 pb-3 lg:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)]/95 px-3 py-2 backdrop-blur">
            <span className="text-[10px] tracking-wide text-[var(--color-fg-subtle)] uppercase">
              от
            </span>
            <div className="font-mono text-base font-semibold text-[var(--color-fg)]">
              {minPrice}₽
            </div>
          </div>
          <a
            href="#variant"
            className="grow rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-[#04121a] shadow-[var(--shadow-glow-sm)]"
          >
            Выбрать тариф
          </a>
        </div>
      </div>
    </>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof Zap; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-2.5 text-sm text-[var(--color-fg-muted)]">
      <Icon className="size-4 shrink-0 text-[var(--color-accent)]" />
      <span>{text}</span>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 font-mono text-sm text-[var(--color-accent)]">
        {n}
      </span>
      <div>
        <div className="font-medium text-[var(--color-fg)]">{title}</div>
        <p className="text-sm text-[var(--color-fg-muted)]">{text}</p>
      </div>
    </li>
  );
}

void Badge;
