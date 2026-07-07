import { getDb } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

const loginWindowMs = 60 * 1000;
const maxLoginAttempts = 5;

type LoginRateLimitRecord = {
  attempts: number;
  window_expires_at: string;
};

export async function checkLoginRateLimit(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  const existing = await db
    .prepare("SELECT attempts, window_expires_at FROM login_rate_limits WHERE email = ? LIMIT 1")
    .bind(normalizedEmail)
    .first<LoginRateLimitRecord>();

  if (!existing || new Date(existing.window_expires_at) <= now) {
    await db
      .prepare(
        `INSERT INTO login_rate_limits (email, attempts, window_expires_at, updated_at)
         VALUES (?, 1, ?, ?)
         ON CONFLICT(email) DO UPDATE SET attempts = 1, window_expires_at = excluded.window_expires_at, updated_at = excluded.updated_at`,
      )
      .bind(normalizedEmail, new Date(now.getTime() + loginWindowMs).toISOString(), nowIso)
      .run();
    return true;
  }

  if (existing.attempts >= maxLoginAttempts) {
    logger.warn("Login rate limit exceeded", { email: normalizedEmail });
    return false;
  }

  await db
    .prepare("UPDATE login_rate_limits SET attempts = attempts + 1, updated_at = ? WHERE email = ?")
    .bind(nowIso, normalizedEmail)
    .run();

  return true;
}

export async function clearLoginRateLimit(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getDb();
  await db.prepare("DELETE FROM login_rate_limits WHERE email = ?").bind(normalizedEmail).run();
}
