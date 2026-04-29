"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { type UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { FormField } from "@/lib/db/schema";

type Props = {
  field: FormField;
  register: UseFormRegisterReturn;
  error?: string;
};

export function DynamicFormField({ field, register, error }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const id = `f-${field.key}`;

  const baseInputClass = cn(
    error ? "border-[var(--color-danger)]/60 focus-visible:border-[var(--color-danger)]" : "",
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {field.label}
        {field.required ? <span className="text-[var(--color-danger)]">*</span> : null}
        {field.encrypted ? (
          <Lock className="size-3 text-[var(--color-accent-emerald)]" aria-label="Шифруется AES-256" />
        ) : null}
      </Label>

      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          placeholder={field.placeholder}
          {...register}
          className={cn(
            "min-h-[88px] w-full rounded-[var(--radius)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] px-3 py-2 text-sm",
            "text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]",
            "transition-colors focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30",
            baseInputClass,
          )}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          {...register}
          className={cn(
            "h-10 w-full rounded-[var(--radius)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg)]",
            "focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
            baseInputClass,
          )}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <input
          id={id}
          type="checkbox"
          {...register}
          className="size-4 rounded border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-accent)]"
        />
      ) : field.type === "password" ? (
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            placeholder={field.placeholder}
            autoComplete="off"
            {...register}
            className={cn("pr-10", baseInputClass)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((x) => !x)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      ) : (
        <Input
          id={id}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder}
          autoComplete={field.type === "email" ? "email" : "off"}
          {...register}
          className={baseInputClass}
        />
      )}

      {field.helperText && !error ? (
        <p className="text-xs text-[var(--color-fg-subtle)]">{field.helperText}</p>
      ) : null}
      {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}
