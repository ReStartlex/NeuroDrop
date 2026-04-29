import Link from "next/link";

import { RegisterForm } from "@/components/public/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Регистрация" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">
            Войти
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
