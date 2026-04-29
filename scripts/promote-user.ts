/**
 * Promote a user to a higher role. Usage:
 *   pnpm tsx scripts/promote-user.ts user@example.com admin
 *   pnpm tsx scripts/promote-user.ts user@example.com manager
 *
 * The role argument is optional (defaults to "admin").
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const { eq } = await import("drizzle-orm");
const { db, schema } = await import("@/lib/db/client");

const email = process.argv[2];
const roleArg = (process.argv[3] ?? "admin") as "admin" | "manager" | "user";

if (!email) {
  console.error("Usage: pnpm tsx scripts/promote-user.ts <email> [admin|manager|user]");
  process.exit(1);
}
if (!["admin", "manager", "user"].includes(roleArg)) {
  console.error(`Invalid role: ${roleArg}. Use admin, manager or user.`);
  process.exit(1);
}

const result = await db
  .update(schema.users)
  .set({ role: roleArg })
  .where(eq(schema.users.email, email))
  .returning({ id: schema.users.id, email: schema.users.email, role: schema.users.role });

if (result.length === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.info(`OK ${result[0]!.email} → role: ${result[0]!.role}`);
process.exit(0);
