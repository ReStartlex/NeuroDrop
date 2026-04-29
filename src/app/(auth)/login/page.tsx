import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/public/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Вход в аккаунт</CardTitle>
        <CardDescription>
          Используйте email и пароль. Если ещё не зарегистрированы —{" "}
          <Link href="/register" className="text-[var(--color-accent)] hover:underline">
            создайте аккаунт
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
