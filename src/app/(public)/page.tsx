import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const upcoming = [
  { label: "ChatGPT Plus", note: "Продление и готовый аккаунт" },
  { label: "Cursor Pro", note: "Продление 1м/12м" },
  { label: "Claude Pro / Max", note: "Продление" },
  { label: "Gemini Advanced", note: "Готовый аккаунт" },
  { label: "Perplexity Pro", note: "12 месяцев" },
  { label: "YouTube Premium", note: "Семейный 12м" },
  { label: "Spotify Premium", note: "Семейный" },
  { label: "Canva Pro", note: "12 месяцев" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 lg:py-36">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-3 py-1 text-xs text-[var(--color-fg-muted)] backdrop-blur">
              <Sparkles className="size-3.5 text-[var(--color-accent)]" />
              Скоро запуск · работаем над MVP
            </span>

            <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-gradient">Зарубежные подписки.</span>
              <br />
              <span className="text-gradient-accent">Оплата в рублях.</span>
            </h1>

            <p className="max-w-2xl text-base text-[var(--color-fg-muted)] md:text-lg">
              ChatGPT, Cursor, Claude, Gemini, Spotify, YouTube Premium и другие сервисы. Продление
              вашего аккаунта или готовый — без VPN, иностранных карт и серых посредников.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/services">
                  Перейти в каталог <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Как это работает</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-fg-subtle)]">
              <span className="inline-flex items-center gap-2">
                <Zap className="size-4 text-[var(--color-accent)]" /> Выдача за минуты
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--color-accent-emerald)]" /> Гарантия
                замены
              </span>
              <span className="inline-flex items-center gap-2 font-mono">
                · 152-ФЗ · оплата через ФНС «Мой налог»
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
        <div className="surface-elevated p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                В каталоге появятся
              </h2>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                Стартовый набор — 13 сервисов. Цены и наличие — в момент запуска.
              </p>
            </div>
            <span className="hidden font-mono text-xs text-[var(--color-fg-subtle)] md:inline">
              v0.1.0 · phase 0
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {upcoming.map((item) => (
              <li
                key={item.label}
                className="group flex flex-col gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-4 transition-colors hover:border-[var(--color-accent)]/40"
              >
                <span className="font-display text-sm font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                  {item.label}
                </span>
                <span className="text-xs text-[var(--color-fg-subtle)]">{item.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
