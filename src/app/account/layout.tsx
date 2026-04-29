import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/public/site-header";
import { auth } from "@/lib/auth/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">{children}</main>
    </div>
  );
}
