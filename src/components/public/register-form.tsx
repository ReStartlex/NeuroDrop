"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/client";

const schema = z.object({
  name: z.string().min(2, "Введите имя"),
  email: z.string().email("Некорректный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Za-z]/, "Должна быть хотя бы одна буква")
    .regex(/[0-9]/, "Должна быть хотя бы одна цифра"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const { error } = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/account",
      });
      if (error) {
        toast.error(error.message ?? "Не удалось создать аккаунт");
        return;
      }
      toast.success("Аккаунт создан");
      router.push("/account");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" autoComplete="name" placeholder="Алексей" {...register("name")} />
        {errors.name && (
          <span className="text-xs text-[var(--color-danger)]">{errors.name.message}</span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-[var(--color-danger)]">{errors.email.message}</span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов, буква и цифра"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-xs text-[var(--color-danger)]">{errors.password.message}</span>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Создаём…" : "Создать аккаунт"}
      </Button>

      <p className="text-xs text-[var(--color-fg-subtle)]">
        Создавая аккаунт, вы соглашаетесь с{" "}
        <a href="/legal/offer" className="text-[var(--color-accent)] hover:underline">
          публичной офертой
        </a>{" "}
        и{" "}
        <a href="/legal/privacy" className="text-[var(--color-accent)] hover:underline">
          политикой конфиденциальности
        </a>
        .
      </p>
    </form>
  );
}
