import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const groups = [
  {
    title: "Сервис",
    links: [
      { href: "/services", label: "Каталог" },
      { href: "/blog", label: "Блог" },
      { href: "/about", label: "О нас" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
  {
    title: "Юридическое",
    links: [
      { href: "/legal/offer", label: "Публичная оферта" },
      { href: "/legal/privacy", label: "Политика конфиденциальности" },
      { href: "/legal/terms", label: "Условия использования" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { href: "/account", label: "Личный кабинет" },
      { href: "https://t.me/neurodrop", label: "Telegram" },
      { href: "mailto:hello@neurodrop.ru", label: "Email" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)]/60 bg-[var(--color-bg)]/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-[var(--color-fg-muted)]">
            Зарубежные подписки в рублях. Быстрая выдача, поддержка 24/7, гарантия замены.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
              {group.title}
            </h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-border)]/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-[var(--color-fg-subtle)] md:flex-row md:items-center md:px-6">
          <p>© {new Date().getFullYear()} NeuroDrop. Все права защищены.</p>
          <p className="font-mono">самозанятый · ИНН будет указан после регистрации</p>
        </div>
      </div>
    </footer>
  );
}
