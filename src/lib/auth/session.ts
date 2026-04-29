import "server-only";

import { auth } from "@/lib/auth/server";

import type { User } from "@/lib/db/schema";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "phone" | "telegramId">;

/**
 * Best-effort session lookup. Returns null when no session is present so
 * callers can decide on a 401 response shape themselves.
 */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  const user = session.user as unknown as SessionUser;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    telegramId: user.telegramId,
  };
}

export async function requireUser(req: Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, "auth_required");
  return user;
}

export async function requireAdmin(req: Request): Promise<SessionUser> {
  const user = await requireUser(req);
  if (user.role !== "admin" && user.role !== "manager") {
    throw new HttpError(403, "admin_required");
  }
  return user;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}
