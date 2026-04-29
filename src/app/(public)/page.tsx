import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  KeyRound,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { CatalogSearch } from "@/components/public/catalog-search";
import { ProductCard } from "@/components/public/product-card";
import { ServiceLogo } from "@/components/public/service-logo";
import { JsonLd } from "@/components/shared/json-ld";
import { Reveal } from "@/components/shared/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqPage, organization, website } from "@/lib/seo/jsonld";
import { listCategories, listFeaturedProducts, listProducts } from "@/server/services/catalog";

const HOW_IT_WORKS = [
  {
    icon: Sparkles,
    title: "Выберите сервис",
    text: "Каталог из 13 топовых подписок: AI, видео, музыка, дизайн, разработка.",
  },
  {
    icon: KeyRound,
    title: "Тариф под себя",
    text: "Продление на ваш аккаунт или готовый — мы возьмём то, что удобнее.",
  },
  {
    icon: Wallet,
    title: "Оплата в рублях",
    text: "Картой РФ или СБП через Lava.top. Чек ФНС придёт автоматически.",
  },
  {
    icon: Zap,
    title: "Доступ за минуты",
    text: "Готовый аккаунт — мгновенно. Продление — обычно до часа после оплаты.",
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Шифрование данных",
    text: "Ваши логины и пароли шифруются AES-256-GCM с ротацией ключей. Доступ — только для исполнения заказа, всё пишется в audit log.",
  },
  {
    icon: CheckCircle2,
    title: "Гарантия замены",
    text: "Если по нашей вине доступ не работает — заменим аккаунт или вернём деньги. Без споров.",
  },
  {
    icon: MessageCircle,
    title: "Живая поддержка",
    text: "Чат на сайте + Telegram. Отвечаем человеком, не ботом, средняя скорость — 5 минут.",
  },
  {
    icon: Receipt,
    title: "Белая работа",
    text: "Самозанятый, чеки ФНС, публичная оферта. Никаких серых схем — только официально.",
  },
];

const FAQ = [
  {
    question: "Это легально и безопасно?",
    answer:
      "Да. Мы посредники: помогаем оплатить зарубежную подписку с российской карты. Сами подписки официальные — на серверах OpenAI, Google, Anthropic, Spotify и т.д. Никаких пиратских ключей и сгенерированных аккаунтов.",
  },
  {
    question: "Какие есть способы оплаты?",
    answer:
      "Карта РФ (Мир, МИР+UnionPay), СБП. Криптоплатежи (USDT/TON) подключим вторым этапом. Эквайринг — Lava.top, поддерживает самозанятых и автоматически отправляет чеки в ФНС.",
  },
  {
    question: "Что значит «продление вашего аккаунта»?",
    answer:
      "Вы оставляете логин и пароль через зашифрованную форму на сайте. Мы продлеваем подписку на вашем аккаунте (вы остаётесь владельцем). Через 30 дней после выполнения заказа данные автоматически удаляются.",
  },
  {
    question: "Что значит «готовый аккаунт»?",
    answer:
      "Это новый аккаунт, на котором уже активна подписка. Получаете логин и пароль, сразу пользуетесь. Email и пароль можно менять. Гарантия замены при блокировке.",
  },
  {
    question: "Как быстро получу доступ?",
    answer:
      "Готовый аккаунт — за 1–10 минут после оплаты, автоматически. Продление вашего аккаунта — обычно 15–60 минут (нужна ручная проверка оператором).",
  },
  {
    question: "Возможен возврат?",
    answer:
      "Да, по правилам публичной оферты. Если доступ не предоставлен или сервис заблокирован по нашей вине — возвращаем 100%. После начала продления возврат частичный.",
  },
];

export default async function HomePage() {
  const [featured, categories, allCatalog] = await Promise.all([
    listFeaturedProducts(8),
    listCategories(),
    listProducts({ perPage: 20, sort: "popular" }),
  ]);
  // Duplicate for an infinite marquee track.
  const marqueeItems = [...allCatalog.items, ...allCatalog.items];

  return (
    <>
      <JsonLd data={[organization(), website(), faqPage(FAQ)]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]/60">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="aurora pointer-events-none opacity-90" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 lg:py-36">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-3 py-1 text-xs text-[var(--color-fg-muted)] backdrop-blur">
              <Sparkles className="size-3.5 text-[var(--color-accent)]" />
              13 сервисов · оплата в ₽ · выдача за минуты
            </span>

            <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-gradient">Зарубежные подписки.</span>
              <br />
              <span className="text-gradient-accent">Оплата в рублях.</span>
            </h1>

            <p className="max-w-2xl text-base text-[var(--color-fg-muted)] md:text-lg">
              ChatGPT, Cursor, Claude, Gemini, Perplexity, Spotify, YouTube Premium и другие
              сервисы. Продление вашего аккаунта или готовый — без VPN, иностранных карт и серых
              посредников.
            </p>

            <div className="w-full max-w-xl">
              <Suspense
                fallback={
                  <div className="h-11 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]" />
                }
              >
                <CatalogSearch placeholder="Найти сервис: ChatGPT, Cursor, Spotify…" />
              </Suspense>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/services">
                  Перейти в каталог <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">Как это работает</Link>
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-fg-subtle)]">
              <span className="inline-flex items-center gap-2">
                <Zap className="size-4 text-[var(--color-accent)]" /> Выдача за минуты
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--color-accent-emerald)]" /> Гарантия
                замены
              </span>
              <span className="inline-flex items-center gap-2">
                <Receipt className="size-4 text-[var(--color-accent-indigo)]" /> Чеки ФНС автоматом
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo marquee — sneak peek of the whole catalog */}
      <section
        aria-label="Сервисы в каталоге"
        className="border-b border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/40 py-8"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
              13 сервисов · ежедневное пополнение
            </p>
            <div className="marquee w-full">
              <div className="marquee-track py-1">
                {marqueeItems.map((p, i) => (
                  <Link
                    key={`${p.id}-${i}`}
                    href={`/services/${p.slug}`}
                    className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-fg)]"
                  >
                    <ServiceLogo
                      title={p.title}
                      accentColor={p.accentColor}
                      logoUrl={p.logoUrl}
                      size="sm"
                    />
                    <span className="font-display whitespace-nowrap">{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
              популярное
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
              Топ сервисов недели
            </h2>
          </div>
          <Link
            href="/services"
            className="hidden text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-accent)] sm:inline-flex sm:items-center sm:gap-1.5"
          >
            Весь каталог
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal
        as="section"
        className="border-y border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--color-fg-muted)]">
            По категориям
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/services?category=${c.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal
        as="section"
        id="how-it-works"
        className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24"
      >
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
            процесс
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
            Как это работает
          </h2>
          <p className="mt-3 text-[var(--color-fg-muted)]">
            Четыре шага от выбора до доступа. Без VPN, регистрации в зарубежных банках и серых
            обменников.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, idx) => (
            <div
              key={step.title}
              className="group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-6 transition-colors duration-200 ease-[var(--ease-emphasized)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]/40"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20 transition-transform group-hover:scale-110">
                  <step.icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-[var(--color-fg-subtle)]">0{idx + 1}</span>
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-sm text-[var(--color-fg-muted)]">{step.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Advantages */}
      <Reveal
        as="section"
        className="border-y border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="mb-10 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
                почему мы
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
                Сервис, которому можно доверить пароль
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {ADVANTAGES.map((adv) => (
              <div
                key={adv.title}
                className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-6 transition-all duration-200 ease-[var(--ease-emphasized)] hover:-translate-y-0.5 hover:border-[var(--color-accent-emerald)]/40"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] ring-1 ring-[var(--color-accent-emerald)]/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <adv.icon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">
                  {adv.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{adv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-widest text-[var(--color-fg-subtle)] uppercase">
            faq
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-4xl">
            Частые вопросы
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-6"
        >
          {FAQ.map((q) => (
            <AccordionItem key={q.question} value={q.question}>
              <AccordionTrigger>{q.question}</AccordionTrigger>
              <AccordionContent>{q.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 p-10 text-center md:p-16">
          <div className="aurora pointer-events-none opacity-80" aria-hidden />
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              <span className="text-gradient">Готовы попробовать?</span>
            </h2>
            <p className="max-w-xl text-[var(--color-fg-muted)]">
              13 сервисов в каталоге, от 290 ₽ за подписку. Подключите ChatGPT за 7 минут.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/services">
                  Открыть каталог <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="https://t.me/neurodrop">
                  <MessageCircle className="size-4" />
                  Написать в Telegram
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}

void CreditCard;
