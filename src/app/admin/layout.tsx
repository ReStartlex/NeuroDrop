import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { auth } from "@/lib/auth/server";

const navItems = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/chats", label: "Чаты" },
  { href: "/admin/settings", label: "Настройки" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/admin");

  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "manager") notFound();

  return (
    <div className="grid min-h-dvh grid-cols-[260px_1fr]">
      <aside className="border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 backdrop-blur">
        <div className="border-b border-[var(--color-border)] p-5">
          <Link href="/admin" aria-label="NeuroDrop admin">
            <Logo size="sm" />
          </Link>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-[var(--color-fg-subtle)] uppercase">
            admin · {role}
          </p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="overflow-x-hidden p-6 md:p-8">{children}</main>
    </div>
  );
}
