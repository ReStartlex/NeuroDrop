import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "manager", "admin"]);

/**
 * Better-Auth core: user. Our custom fields (phone, role, telegramId) are merged here
 * so the auth client can read them directly via session.user.
 */
export const users = pgTable(
  "user",
  {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    name: text(),
    image: text(),

    phone: text(),
    role: userRoleEnum().notNull().default("user"),
    telegramId: text(),
    bannedAt: timestamp({ withTimezone: true, mode: "date" }),

    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("user_role_idx").on(t.role), index("user_telegram_id_idx").on(t.telegramId)],
);

export const sessions = pgTable(
  "session",
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId),
    uniqueIndex("account_provider_account_unique").on(t.providerId, t.accountId),
  ],
);

export const verifications = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/**
 * Append-only log of any access to sensitive customer data (decryption,
 * credential delivery, refunds, role changes). Required by бриф §3.5 and §13.5.
 * Never delete rows; rotate via partition or archival.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    actorUserId: text().references(() => users.id, { onDelete: "set null" }),
    action: text().notNull(),
    entityType: text().notNull(),
    entityId: text(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_log_actor_idx").on(t.actorUserId),
    index("audit_log_entity_idx").on(t.entityType, t.entityId),
    index("audit_log_created_at_idx").on(t.createdAt),
  ],
);

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: jsonb().$type<unknown>().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

/* -----------------------------------------------------------------------
 * Catalog: categories → products → product_variants
 * ----------------------------------------------------------------------- */

export const categories = pgTable(
  "category",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    icon: text(),
    sortOrder: integer().notNull().default(0),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("category_active_sort_idx").on(t.isActive, t.sortOrder)],
);

export const products = pgTable(
  "product",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    categoryId: uuid().references(() => categories.id, { onDelete: "set null" }),

    title: text().notNull(),
    shortDescription: text().notNull(),
    fullDescription: text(),

    accentColor: text().notNull().default("#22D3EE"),
    logoUrl: text(),
    coverUrl: text(),

    metaTitle: text(),
    metaDescription: text(),
    ogImageUrl: text(),

    isActive: boolean().notNull().default(true),
    isFeatured: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),

    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("product_active_sort_idx").on(t.isActive, t.sortOrder),
    index("product_category_idx").on(t.categoryId),
    index("product_featured_idx").on(t.isFeatured),
  ],
);

export const variantTypeEnum = pgEnum("variant_type", ["renew", "ready_account", "custom"]);

export const productVariants = pgTable(
  "product_variant",
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    name: text().notNull(),
    type: variantTypeEnum().notNull(),
    durationDays: integer(),

    priceRub: integer().notNull(),
    costPriceRub: integer(),

    formSchema: jsonb().$type<FormSchema>().notNull().default({ fields: [] }),
    deliveryTemplate: text(),

    stock: integer(),
    isActive: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),

    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("variant_product_idx").on(t.productId, t.sortOrder),
    index("variant_active_idx").on(t.isActive),
    check("variant_price_positive", sql`${t.priceRub} >= 0`),
  ],
);

export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);

/**
 * Reviews. order_id is nullable for now to allow seeded/admin-injected reviews
 * before the orders table exists (Phase 1.5). Once orders land we will tighten
 * with a partial unique index on (order_id) where order_id is not null.
 */
export const reviews = pgTable(
  "review",
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text().references(() => users.id, { onDelete: "set null" }),

    authorName: text(),
    rating: integer().notNull(),
    text: text().notNull(),
    status: reviewStatusEnum().notNull().default("pending"),
    adminResponse: text(),

    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("review_product_status_idx").on(t.productId, t.status),
    index("review_created_at_idx").on(t.createdAt),
    check("review_rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ],
);

/* -----------------------------------------------------------------------
 * Orders + order messages
 * ----------------------------------------------------------------------- */

export const orderStatusEnum = pgEnum("order_status", [
  "awaiting_payment",
  "paid",
  "in_progress",
  "completed",
  "cancelled",
  "failed",
  "refunded",
]);

export const orders = pgTable(
  "order",
  {
    id: uuid().primaryKey().defaultRandom(),
    publicId: text().notNull().unique(),

    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    variantId: uuid().references(() => productVariants.id, { onDelete: "set null" }),
    productSnapshot: jsonb().$type<ProductSnapshot>().notNull(),

    status: orderStatusEnum().notNull().default("awaiting_payment"),
    amountRub: integer().notNull(),

    /**
     * Customer-provided sensitive data (login/password for renew, etc.)
     * encrypted with AES-256-GCM envelope encryption (src/lib/crypto/envelope.ts).
     * Nullable to allow ready_account orders that don't require customer credentials.
     * Auto-purged after sensitivePurgeAt elapses (default: 30 days post-fulfillment).
     */
    formDataEncrypted: text(),

    /**
     * Credentials/access info delivered by admin to the customer
     * (e.g. login + password for a ready account). Encrypted same as formDataEncrypted.
     */
    credentialsEncrypted: text(),
    deliveredText: text(),

    paymentProvider: text(),
    paymentExternalId: text(),
    paymentUrl: text(),

    paidAt: timestamp({ withTimezone: true, mode: "date" }),
    fulfilledAt: timestamp({ withTimezone: true, mode: "date" }),
    fulfilledByUserId: text().references(() => users.id, { onDelete: "set null" }),

    expiresAt: timestamp({ withTimezone: true, mode: "date" }),
    sensitivePurgeAt: timestamp({ withTimezone: true, mode: "date" }),

    notes: text(),

    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("order_user_idx").on(t.userId, t.createdAt),
    index("order_status_idx").on(t.status),
    index("order_variant_idx").on(t.variantId),
    index("order_purge_idx").on(t.sensitivePurgeAt),
  ],
);

export const messageSenderEnum = pgEnum("message_sender", ["user", "admin", "system"]);

export const orderMessages = pgTable(
  "order_message",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    senderUserId: text().references(() => users.id, { onDelete: "set null" }),
    senderRole: messageSenderEnum().notNull(),
    text: text().notNull(),
    readByUserAt: timestamp({ withTimezone: true, mode: "date" }),
    readByAdminAt: timestamp({ withTimezone: true, mode: "date" }),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("order_message_order_created_idx").on(t.orderId, t.createdAt),
    index("order_message_unread_user_idx").on(t.orderId, t.readByUserAt),
  ],
);

/* -----------------------------------------------------------------------
 * Form schema for product variants (used by checkout dynamic form).
 * Lives in TS only; persisted as jsonb in productVariants.formSchema.
 * ----------------------------------------------------------------------- */

export type FormFieldType = "text" | "password" | "textarea" | "email" | "select" | "checkbox";

export type FormFieldOption = { label: string; value: string };

export type FormField = {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  encrypted?: boolean;
  options?: FormFieldOption[];
  helperText?: string;
};

export type FormSchema = { fields: FormField[] };

/**
 * Snapshot of product/variant info captured at order-creation time so the
 * order page keeps showing accurate names even if the catalog later changes.
 */
export type ProductSnapshot = {
  productId: string;
  productSlug: string;
  productTitle: string;
  productAccentColor: string;
  variantName: string;
  variantType: "renew" | "ready_account" | "custom";
  durationDays: number | null;
};

/* -----------------------------------------------------------------------
 * Inferred row types
 * ----------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type OrderMessage = typeof orderMessages.$inferSelect;
export type NewOrderMessage = typeof orderMessages.$inferInsert;
export type MessageSender = (typeof messageSenderEnum.enumValues)[number];
