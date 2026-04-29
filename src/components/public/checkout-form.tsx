"use client";

import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { toast } from "sonner";

import { DynamicFormField } from "@/components/public/dynamic-form-field";
import { PriceTag } from "@/components/public/price-tag";
import { Button } from "@/components/ui/button";

import { buildResolver } from "./checkout-resolver";

import type { FormSchema } from "@/lib/db/schema";


type Props = {
  variantId: string;
  formSchema: FormSchema;
  amountRub: number;
};

export function CheckoutForm({ variantId, formSchema, amountRub }: Props) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: buildResolver(formSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, formData: values }),
      });
      const json = (await res.json()) as
        | { ok: true; data: { id: string; publicId: string; status: string } }
        | { ok: false; error: { code: string; message?: string } };

      if (!res.ok || !json.ok) {
        if (res.status === 401) {
          router.push(`/login?next=/checkout/${variantId}`);
          return;
        }
        const message =
          (!json.ok && (json.error.message ?? json.error.code)) || "Не удалось создать заказ";
        toast.error(message);
        return;
      }

      toast.success(`Заказ ${json.data.publicId} создан`);
      router.push(`/account/orders/${json.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Сетевая ошибка");
    } finally {
      setSubmitting(false);
    }
  });

  const hasFields = formSchema.fields.length > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {hasFields ? (
        <>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-accent-emerald)]/20 bg-[var(--color-accent-emerald)]/5 p-3 text-xs text-[var(--color-fg-muted)]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-accent-emerald)]">
              <Lock className="size-3.5" /> Шифруется AES-256-GCM
            </span>
            <span className="ml-1">
              · доступ только для исполнения заказа · удаляется через 30 дней
            </span>
          </div>

          <div className="space-y-4">
            {formSchema.fields.map((field) => {
              const errMsg = (errors as Record<string, { message?: string } | undefined>)[field.key]
                ?.message;
              return (
                <DynamicFormField
                  key={field.key}
                  field={field}
                  register={register(field.key)}
                  {...(errMsg ? { error: errMsg } : {})}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4 text-sm text-[var(--color-fg-muted)]">
          Дополнительная информация не требуется. После оплаты менеджер выдаст готовый аккаунт в чат заказа.
        </div>
      )}

      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-4">
        <div>
          <div className="text-xs text-[var(--color-fg-subtle)]">К оплате</div>
          <PriceTag amount={amountRub} size="lg" />
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Создаём…" : "Перейти к оплате"}
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <p className="flex items-start gap-2 text-[10px] leading-relaxed text-[var(--color-fg-subtle)]">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--color-accent-emerald)]" />
        Нажимая «Перейти к оплате», вы соглашаетесь с публичной офертой и политикой
        конфиденциальности. Оплата проходит через Lava.top — карта РФ или СБП.
      </p>
    </form>
  );
}
