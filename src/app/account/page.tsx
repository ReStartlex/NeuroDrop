import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";

export const metadata = { title: "Личный кабинет" };

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Личный кабинет</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {user?.email ? `Привет, ${user.name ?? user.email}` : ""}
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Заказы</CardTitle>
          <CardDescription>
            Здесь появятся ваши покупки. Каталог запускается в Фазе 1.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-fg-subtle)]">Пока пусто.</p>
          <form action="/api/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              Выйти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
