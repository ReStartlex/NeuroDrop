import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { auth } from "@/lib/auth/server";

const NAV = [
  { href: "/account", label: "Обзор" },
  { href: "/account/orders", label: "Мои заказы" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/account");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="border-b border-[var(--color-border)]/60 bg-[var(--color-bg-elevated)]/40">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 md:px-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-1.5 text-sm text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
