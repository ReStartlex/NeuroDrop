import { ZodError } from "zod";

import { HttpError } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export function ok<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
}

export function fail(status: number, code: string, message?: string, details?: unknown): Response {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message: message ?? code, details } }),
    { status, headers: { "content-type": "application/json" } },
  );
}

/**
 * Standard error envelope. Logs unexpected errors and returns a sanitized
 * message to the client.
 */
export function handleError(err: unknown, context: Record<string, unknown> = {}): Response {
  if (err instanceof HttpError) {
    return fail(err.status, err.code, err.message);
  }
  if (err instanceof ZodError) {
    return fail(400, "validation_error", "Invalid input", err.flatten());
  }
  logger.error({ err, ...context }, "api_error");
  const message = err instanceof Error ? err.message : "Unknown error";
  return fail(500, "internal_error", message);
}
