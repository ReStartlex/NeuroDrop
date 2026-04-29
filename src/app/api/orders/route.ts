import { eq } from "drizzle-orm";
import { z } from "zod";

import { fail, handleError, ok } from "@/lib/api/respond";
import { zodFromFormSchema } from "@/lib/api/zod-from-form-schema";
import { requireUser } from "@/lib/auth/session";
import { db, schema } from "@/lib/db/client";
import { createOrder } from "@/server/services/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  variantId: z.string().uuid(),
  formData: z.record(z.string(), z.string()).default({}),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser(req);
    const json = await req.json();
    const { variantId, formData } = bodySchema.parse(json);

    const [variant] = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, variantId))
      .limit(1);
    if (!variant || !variant.isActive) {
      return fail(404, "variant_not_found", "Тариф не найден или отключён");
    }

    const validator = zodFromFormSchema(variant.formSchema);
    const validated = validator.parse(formData);

    const order = await createOrder({
      userId: user.id,
      variantId,
      formData: validated as Record<string, string>,
    });

    return ok({ id: order.id, publicId: order.publicId, status: order.status }, { status: 201 });
  } catch (err) {
    return handleError(err, { route: "POST /api/orders" });
  }
}
