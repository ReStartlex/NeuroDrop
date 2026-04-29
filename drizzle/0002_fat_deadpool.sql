CREATE TYPE "public"."message_sender" AS ENUM('user', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('awaiting_payment', 'paid', 'in_progress', 'completed', 'cancelled', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "order_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"sender_user_id" text,
	"sender_role" "message_sender" NOT NULL,
	"text" text NOT NULL,
	"read_by_user_at" timestamp with time zone,
	"read_by_admin_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"user_id" text NOT NULL,
	"variant_id" uuid,
	"product_snapshot" jsonb NOT NULL,
	"status" "order_status" DEFAULT 'awaiting_payment' NOT NULL,
	"amount_rub" integer NOT NULL,
	"form_data_encrypted" text,
	"credentials_encrypted" text,
	"delivered_text" text,
	"payment_provider" text,
	"payment_external_id" text,
	"payment_url" text,
	"paid_at" timestamp with time zone,
	"fulfilled_at" timestamp with time zone,
	"fulfilled_by_user_id" text,
	"expires_at" timestamp with time zone,
	"sensitive_purge_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_publicId_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "order_message" ADD CONSTRAINT "order_message_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_message" ADD CONSTRAINT "order_message_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_fulfilled_by_user_id_user_id_fk" FOREIGN KEY ("fulfilled_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_message_order_created_idx" ON "order_message" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_message_unread_user_idx" ON "order_message" USING btree ("order_id","read_by_user_at");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "order" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_variant_idx" ON "order" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "order_purge_idx" ON "order" USING btree ("sensitive_purge_at");