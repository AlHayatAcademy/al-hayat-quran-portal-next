import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function createPasswordSetupInvite(userId: string, createdBy: string | null) {
  const db = await getDb();
  const inviteId = crypto.randomUUID();
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare(
      `INSERT INTO invitation_tokens (id, user_id, token_hash, purpose, expires_at, created_by)
       VALUES (?, ?, ?, 'password_setup', ?, ?)`,
    )
    .bind(inviteId, userId, await hashToken(token), expiresAt, createdBy)
    .run();

  return { id: inviteId, token, expiresAt };
}
