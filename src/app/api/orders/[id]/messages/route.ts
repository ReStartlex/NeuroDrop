import { z } from "zod";

import { fail, handleError, ok } from "@/lib/api/respond";
import { requireUser } from "@/lib/auth/session";
import {
  addOrderMessage,
  getMyOrder,
  getOrderForAdmin,
  listOrderMessages,
  markMessagesRead,
} from "@/server/services/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const postBody = z.object({ text: z.string().min(1).max(4000) });

async function ensureAccess(args: {
  orderId: string;
  userId: string;
  role: string;
}): Promise<"user" | "admin"> {
  if (args.role === "admin" || args.role === "manager") {
    const order = await getOrderForAdmin(args.orderId);
    if (!order) throw Object.assign(new Error("not_found"), { status: 404 });
    return "admin";
  }
  const order = await getMyOrder({ orderId: args.orderId, userId: args.userId });
  if (!order) throw Object.assign(new Error("not_found"), { status: 404 });
  return "user";
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const role = await ensureAccess({ orderId: id, userId: user.id, role: user.role });

    const messages = await listOrderMessages(id);
    await markMessagesRead({ orderId: id, by: role });

    return ok({ messages });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && err.status === 404) {
      return fail(404, "not_found");
    }
    return handleError(err, { route: "GET /api/orders/[id]/messages" });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const role = await ensureAccess({ orderId: id, userId: user.id, role: user.role });

    const body = postBody.parse(await req.json());

    const message = await addOrderMessage({
      orderId: id,
      senderUserId: user.id,
      senderRole: role,
      text: body.text,
    });

    return ok({ message }, { status: 201 });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && err.status === 404) {
      return fail(404, "not_found");
    }
    return handleError(err, { route: "POST /api/orders/[id]/messages" });
  }
}
