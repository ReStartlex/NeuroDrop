import { z } from "zod";

import { fail, handleError, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import {
  cancelOrder,
  fulfillOrder,
  getOrderForAdmin,
  InvalidOrderTransitionError,
  revealFormData,
  startProcessing,
} from "@/server/services/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({ action: z.literal("reveal") }),
  z.object({
    action: z.literal("fulfill"),
    deliveredText: z.string().min(1).max(4000),
    credentials: z.string().max(8000).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
  z.object({ action: z.literal("cancel"), reason: z.string().min(1).max(500) }),
]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const admin = await requireAdmin(req);
    const { id } = await ctx.params;
    const order = await getOrderForAdmin(id);
    if (!order) return fail(404, "not_found");

    const body = bodySchema.parse(await req.json());

    switch (body.action) {
      case "start": {
        const updated = await startProcessing({ orderId: id, actorUserId: admin.id });
        return ok({ status: updated.status });
      }
      case "reveal": {
        const formData = await revealFormData({ orderId: id, actorUserId: admin.id });
        return ok({ formData });
      }
      case "fulfill": {
        const updated = await fulfillOrder({
          orderId: id,
          actorUserId: admin.id,
          deliveredText: body.deliveredText,
          ...(body.credentials !== undefined ? { credentials: body.credentials } : {}),
          ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
        });
        return ok({ status: updated.status });
      }
      case "cancel": {
        const updated = await cancelOrder({
          orderId: id,
          actorUserId: admin.id,
          reason: body.reason,
        });
        return ok({ status: updated.status });
      }
    }
  } catch (err) {
    if (err instanceof InvalidOrderTransitionError) {
      return fail(409, "invalid_transition", err.message);
    }
    return handleError(err, { route: "POST /api/admin/orders/[id]/actions" });
  }
}
