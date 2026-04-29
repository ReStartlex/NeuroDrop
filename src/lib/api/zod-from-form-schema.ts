import { z } from "zod";

import type { FormSchema } from "@/lib/db/schema";

/**
 * Build a Zod object schema from a runtime FormSchema. Each field becomes a
 * string entry; required/optional and basic length constraints are enforced.
 * Email/text/textarea/password all get validated as plain strings (we don't
 * try to validate password complexity — UX, not security).
 */
export function zodFromFormSchema(schema: FormSchema): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of schema.fields) {
    let value: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        value = z.string().email("Некорректный email");
        break;
      case "select":
        value = z.string();
        if (field.options && field.options.length > 0) {
          value = z.enum(field.options.map((o) => o.value) as [string, ...string[]]);
        }
        break;
      case "checkbox":
        value = z.union([z.literal("on"), z.literal("true"), z.literal(""), z.literal("false")]);
        break;
      default:
        value = z.string();
    }

    if (field.required) {
      if (value instanceof z.ZodString) {
        value = value.min(1, "Обязательное поле").max(2048);
      }
    } else {
      value = value.optional().or(z.literal(""));
    }

    shape[field.key] = value;
  }

  return z.object(shape);
}
