import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldValues, type Resolver } from "react-hook-form";

import { zodFromFormSchema } from "@/lib/api/zod-from-form-schema";

import type { FormSchema } from "@/lib/db/schema";

export function buildResolver(schema: FormSchema): Resolver<FieldValues> {
  const zod = zodFromFormSchema(schema);
  return zodResolver(zod) as Resolver<FieldValues>;
}
