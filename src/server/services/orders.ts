import "server-only";

import { randomBytes } from "node:crypto";

import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { decrypt, encrypt } from "@/lib/crypto/envelope";
import { db, schema } from "@/lib/db/client";
import { logger } from "@/lib/logger";

import type {
  MessageSender,
  Order,
  OrderMessage,
  OrderStatus,
  ProductSnapshot,
} from "@/lib/db/schema";

/* -------------------------------------------------------------------------
 * IDs and helpers
 * ------------------------------------------------------------------------- */

const ID_ALPHABET = "ACDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/B for legibility

function generatePublicId(): string {
  const now = new Date();
  const yymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Array.from(randomBytes(5))
    .map((b) => ID_ALPHABET[b % ID_ALPHABET.length])
    .join("");
  return `ND-${yymm}-${random}`;
}

const PURGE_DAYS = 30;
function purgeAtFromNow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + PURGE_DAYS);
  return d;
}

/* -------------------------------------------------------------------------
 * Audit log
 * ------------------------------------------------------------------------- */

async function audit(args: {
  actorUserId: string | null;
  action: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(schema.auditLog).values({
    actorUserId: args.actorUserId,
    action: args.action,
    entityType: "order",
    entityId: args.entityId,
    metadata: args.metadata ?? null,
  });
}

/* -------------------------------------------------------------------------
 * Create
 * ------------------------------------------------------------------------- */

export type CreateOrderArgs = {
  userId: string;
  variantId: string;
  /** Form data from the checkout form, plain JSON. Encrypted at rest. */
  formData: Record<string, string>;
};

export async function createOrder(args: CreateOrderArgs): Promise<Order> {
  const [variant] = await db
    .select()
    .from(schema.productVariants)
    .where(
      and(eq(schema.productVariants.id, args.variantId), eq(schema.productVariants.isActive, true)),
    )
    .limit(1);
  if (!variant) throw new Error("Variant not found or inactive");

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, variant.productId))
    .limit(1);
  if (!product) throw new Error("Product not found");

  if (typeof variant.stock === "number" && variant.stock <= 0) {
    throw new Error("Variant out of stock");
  }

  const snapshot: ProductSnapshot = {
    productId: product.id,
    productSlug: product.slug,
    productTitle: product.title,
    productAccentColor: product.accentColor,
    variantName: variant.name,
    variantType: variant.type,
    durationDays: variant.durationDays,
  };

  const hasSensitiveFields = Object.keys(args.formData).some((k) =>
    variant.formSchema.fields.some((f) => f.key === k && f.encrypted === true),
  );

  const formDataEncrypted =
    Object.keys(args.formData).length > 0 ? encrypt(JSON.stringify(args.formData)) : null;

  const [created] = await db
    .insert(schema.orders)
    .values({
      publicId: generatePublicId(),
      userId: args.userId,
      variantId: variant.id,
      productSnapshot: snapshot,
      status: "awaiting_payment",
      amountRub: variant.priceRub,
      formDataEncrypted,
      paymentProvider: process.env.NODE_ENV === "production" ? "lava" : "manual",
    })
    .returning();
  if (!created) throw new Error("Failed to create order");

  await audit({
    actorUserId: args.userId,
    action: "order.created",
    entityId: created.id,
    metadata: {
      productSlug: product.slug,
      variantId: variant.id,
      variantType: variant.type,
      amountRub: variant.priceRub,
      hasSensitiveFields,
    },
  });

  await db.insert(schema.orderMessages).values({
    orderId: created.id,
    senderRole: "system",
    text: `Заказ ${created.publicId} создан. Ожидаем оплату — после оплаты автоматически передадим менеджеру.`,
  });

  logger.info(
    { orderId: created.id, publicId: created.publicId, userId: args.userId },
    "order.created",
  );

  return created;
}

/* -------------------------------------------------------------------------
 * Read
 * ------------------------------------------------------------------------- */

export type OrderForUser = Order & { credentialsPlaintext: string | null };

export async function listMyOrders(userId: string): Promise<Order[]> {
  return db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));
}

export async function getMyOrder(args: {
  orderId: string;
  userId: string;
}): Promise<OrderForUser | null> {
  const [row] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, args.orderId), eq(schema.orders.userId, args.userId)))
    .limit(1);
  if (!row) return null;

  let credentialsPlaintext: string | null = null;
  if (row.credentialsEncrypted && row.status !== "cancelled" && row.status !== "refunded") {
    try {
      credentialsPlaintext = decrypt(row.credentialsEncrypted);
    } catch (err) {
      logger.error({ err, orderId: row.id }, "order.credentials.decrypt_failed");
    }
  }

  return { ...row, credentialsPlaintext };
}

export async function getOrderForAdmin(orderId: string): Promise<Order | null> {
  const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  return row ?? null;
}

/**
 * Decrypts customer-provided form data. ALWAYS writes an audit-log entry.
 * Use only on the admin server boundary.
 */
export async function revealFormData(args: {
  orderId: string;
  actorUserId: string;
}): Promise<Record<string, string> | null> {
  const order = await getOrderForAdmin(args.orderId);
  if (!order || !order.formDataEncrypted) return null;

  const plaintext = decrypt(order.formDataEncrypted);
  await audit({
    actorUserId: args.actorUserId,
    action: "order.form_data.viewed",
    entityId: order.id,
    metadata: { publicId: order.publicId },
  });

  return JSON.parse(plaintext) as Record<string, string>;
}

/* -------------------------------------------------------------------------
 * Status transitions
 * ------------------------------------------------------------------------- */

const VALID_TRANSITIONS: Record<OrderStatus, ReadonlyArray<OrderStatus>> = {
  awaiting_payment: ["paid", "cancelled", "failed"],
  paid: ["in_progress", "cancelled", "refunded"],
  in_progress: ["completed", "failed", "cancelled"],
  completed: ["refunded"],
  cancelled: [],
  failed: ["awaiting_payment", "cancelled"],
  refunded: [],
};

export class InvalidOrderTransitionError extends Error {
  constructor(
    public from: OrderStatus,
    public to: OrderStatus,
  ) {
    super(`Invalid order status transition: ${from} -> ${to}`);
  }
}

async function transitionStatus(args: {
  orderId: string;
  to: OrderStatus;
  actorUserId: string | null;
  patch?: Partial<typeof schema.orders.$inferInsert>;
  systemMessage?: string;
}): Promise<Order> {
  const [current] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, args.orderId))
    .limit(1);
  if (!current) throw new Error("Order not found");

  if (!VALID_TRANSITIONS[current.status].includes(args.to)) {
    throw new InvalidOrderTransitionError(current.status, args.to);
  }

  const [updated] = await db
    .update(schema.orders)
    .set({ status: args.to, updatedAt: new Date(), ...(args.patch ?? {}) })
    .where(eq(schema.orders.id, args.orderId))
    .returning();
  if (!updated) throw new Error("Failed to update order");

  await audit({
    actorUserId: args.actorUserId,
    action: `order.status.${args.to}`,
    entityId: args.orderId,
    metadata: { from: current.status, to: args.to },
  });

  if (args.systemMessage) {
    await db.insert(schema.orderMessages).values({
      orderId: args.orderId,
      senderRole: "system",
      text: args.systemMessage,
    });
  }

  return updated;
}

export async function markOrderPaidStub(args: {
  orderId: string;
  actorUserId: string;
}): Promise<Order> {
  return transitionStatus({
    orderId: args.orderId,
    to: "paid",
    actorUserId: args.actorUserId,
    patch: { paidAt: new Date(), paymentExternalId: `dev-${Date.now()}` },
    systemMessage:
      "Оплата подтверждена. Передаём заказ менеджеру — он напишет здесь, как только начнёт работу.",
  });
}

export async function startProcessing(args: {
  orderId: string;
  actorUserId: string;
}): Promise<Order> {
  return transitionStatus({
    orderId: args.orderId,
    to: "in_progress",
    actorUserId: args.actorUserId,
    systemMessage: "Менеджер взял заказ в работу.",
  });
}

export async function fulfillOrder(args: {
  orderId: string;
  actorUserId: string;
  deliveredText: string;
  credentials?: string;
  expiresAt?: Date;
}): Promise<Order> {
  const credentialsEncrypted = args.credentials ? encrypt(args.credentials) : null;
  return transitionStatus({
    orderId: args.orderId,
    to: "completed",
    actorUserId: args.actorUserId,
    patch: {
      fulfilledAt: new Date(),
      fulfilledByUserId: args.actorUserId,
      deliveredText: args.deliveredText,
      credentialsEncrypted,
      ...(args.expiresAt ? { expiresAt: args.expiresAt } : {}),
      sensitivePurgeAt: purgeAtFromNow(),
    },
    systemMessage:
      "Заказ выполнен. Доступ выдан — проверьте детали ниже. Если что-то не работает, напишите в чат — заменим.",
  });
}

export async function cancelOrder(args: {
  orderId: string;
  actorUserId: string;
  reason: string;
}): Promise<Order> {
  return transitionStatus({
    orderId: args.orderId,
    to: "cancelled",
    actorUserId: args.actorUserId,
    patch: { notes: args.reason, sensitivePurgeAt: purgeAtFromNow() },
    systemMessage: `Заказ отменён. Причина: ${args.reason}`,
  });
}

/* -------------------------------------------------------------------------
 * Messages
 * ------------------------------------------------------------------------- */

export async function listOrderMessages(orderId: string): Promise<OrderMessage[]> {
  return db
    .select()
    .from(schema.orderMessages)
    .where(eq(schema.orderMessages.orderId, orderId))
    .orderBy(asc(schema.orderMessages.createdAt));
}

export async function addOrderMessage(args: {
  orderId: string;
  senderUserId: string;
  senderRole: MessageSender;
  text: string;
}): Promise<OrderMessage> {
  const trimmed = args.text.trim();
  if (trimmed.length === 0) throw new Error("Message text cannot be empty");
  if (trimmed.length > 4000) throw new Error("Message too long");

  const [created] = await db
    .insert(schema.orderMessages)
    .values({
      orderId: args.orderId,
      senderUserId: args.senderUserId,
      senderRole: args.senderRole,
      text: trimmed,
    })
    .returning();
  if (!created) throw new Error("Failed to insert message");

  return created;
}

export async function markMessagesRead(args: {
  orderId: string;
  by: "user" | "admin";
}): Promise<void> {
  const now = new Date();
  if (args.by === "user") {
    await db
      .update(schema.orderMessages)
      .set({ readByUserAt: now })
      .where(
        and(
          eq(schema.orderMessages.orderId, args.orderId),
          sql`${schema.orderMessages.readByUserAt} IS NULL`,
          inArray(schema.orderMessages.senderRole, ["admin", "system"]),
        ),
      );
  } else {
    await db
      .update(schema.orderMessages)
      .set({ readByAdminAt: now })
      .where(
        and(
          eq(schema.orderMessages.orderId, args.orderId),
          sql`${schema.orderMessages.readByAdminAt} IS NULL`,
          eq(schema.orderMessages.senderRole, "user"),
        ),
      );
  }
}

/* -------------------------------------------------------------------------
 * Admin listings
 * ------------------------------------------------------------------------- */

export type AdminOrderFilters = {
  status?: OrderStatus | undefined;
  q?: string | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
};

export type AdminOrderListItem = Order & {
  userEmail: string | null;
  userName: string | null;
  unreadFromUser: number;
};

export async function listOrdersForAdmin(filters: AdminOrderFilters = {}): Promise<{
  items: AdminOrderListItem[];
  total: number;
  page: number;
  perPage: number;
}> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const perPage = Math.min(50, Math.max(1, Math.floor(filters.perPage ?? 25)));
  const offset = (page - 1) * perPage;

  const where = [] as Array<ReturnType<typeof eq>>;
  if (filters.status) where.push(eq(schema.orders.status, filters.status));
  if (filters.q && filters.q.trim().length > 0) {
    const pattern = `%${filters.q.trim()}%`;
    where.push(
      or(
        ilike(schema.orders.publicId, pattern),
        ilike(schema.users.email, pattern),
        ilike(schema.users.name, pattern),
      )!,
    );
  }
  const composed = where.length > 0 ? and(...where) : undefined;

  const unreadSql = sql<number>`(
    SELECT COUNT(*)::int FROM ${schema.orderMessages}
    WHERE ${schema.orderMessages.orderId} = ${schema.orders.id}
      AND ${schema.orderMessages.senderRole} = 'user'
      AND ${schema.orderMessages.readByAdminAt} IS NULL
  )`.as("unread_from_user");

  const items = await db
    .select({
      id: schema.orders.id,
      publicId: schema.orders.publicId,
      userId: schema.orders.userId,
      variantId: schema.orders.variantId,
      productSnapshot: schema.orders.productSnapshot,
      status: schema.orders.status,
      amountRub: schema.orders.amountRub,
      formDataEncrypted: schema.orders.formDataEncrypted,
      credentialsEncrypted: schema.orders.credentialsEncrypted,
      deliveredText: schema.orders.deliveredText,
      paymentProvider: schema.orders.paymentProvider,
      paymentExternalId: schema.orders.paymentExternalId,
      paymentUrl: schema.orders.paymentUrl,
      paidAt: schema.orders.paidAt,
      fulfilledAt: schema.orders.fulfilledAt,
      fulfilledByUserId: schema.orders.fulfilledByUserId,
      expiresAt: schema.orders.expiresAt,
      sensitivePurgeAt: schema.orders.sensitivePurgeAt,
      notes: schema.orders.notes,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
      userEmail: schema.users.email,
      userName: schema.users.name,
      unreadFromUser: unreadSql,
    })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.users.id, schema.orders.userId))
    .where(composed)
    .orderBy(desc(schema.orders.createdAt))
    .limit(perPage)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.users.id, schema.orders.userId))
    .where(composed);

  return {
    items: items as AdminOrderListItem[],
    total: totalRow?.total ?? 0,
    page,
    perPage,
  };
}
