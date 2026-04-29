import { fail, handleError, ok } from "@/lib/api/respond";
import { requireUser } from "@/lib/auth/session";
import { getMyOrder, markOrderPaidStub } from "@/server/services/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Dev-only convenience: simulate a successful payment without integrating
 * Lava.top. Disabled in production.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return fail(404, "not_found");
  }
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;

    const order = await getMyOrder({ orderId: id, userId: user.id });
    if (!order) return fail(404, "not_found");
    if (order.status !== "awaiting_payment") {
      return fail(409, "invalid_status", `Заказ в статусе ${order.status}`);
    }

    const updated = await markOrderPaidStub({ orderId: id, actorUserId: user.id });
    return ok({ status: updated.status });
  } catch (err) {
    return handleError(err, { route: "POST /api/orders/[id]/dev-mark-paid" });
  }
}
