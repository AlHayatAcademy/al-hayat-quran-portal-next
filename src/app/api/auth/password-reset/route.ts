import { NextRequest, NextResponse } from "next/server";
import { hashToken } from "@/lib/auth";
import { getCloudflareEnv, getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, passwordResetRequestSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);

    const parsed = await passwordResetRequestSchema.safeParseAsync({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/forgot-password?status=sent", request.url));
    }

    const { email } = await parseRequest(parsed.data, passwordResetRequestSchema);
    const db = await getDb();
    const user = await db
      .prepare("SELECT id, name, email FROM users WHERE lower(email) = ? AND status = 'active' AND deleted_at IS NULL LIMIT 1")
      .bind(email)
      .first<{ id: string; name: string; email: string }>();

    if (user) {
      const token = crypto.randomUUID() + crypto.randomUUID();
      const tokenId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await db
        .prepare("INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
        .bind(tokenId, user.id, await hashToken(token), expiresAt)
        .run();

      const env = await getCloudflareEnv();
      const appUrl = env.APP_URL ?? new URL(request.url).origin;
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${appUrl}/reset-password?token=${encodeURIComponent(token)}`,
      });
      await logAudit(user.id, "create", "password_reset_tokens", tokenId);
    }

    return NextResponse.redirect(new URL("/forgot-password?status=sent", request.url));
  } catch (error) {
    return handleError(error);
  }
}
