import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

const verificationTokenDays = 7;

export async function createEmailVerificationToken(userId: string) {
  const db = await getDb();
  const token = crypto.randomUUID();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + verificationTokenDays * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare("DELETE FROM email_verification_tokens WHERE user_id = ? AND used_at IS NULL")
    .bind(userId)
    .run();

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(id, userId, tokenHash, expiresAt)
    .run();

  return { id, token, expiresAt };
}
