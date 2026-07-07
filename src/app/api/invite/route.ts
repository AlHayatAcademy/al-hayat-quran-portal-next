import { NextRequest, NextResponse } from "next/server";
import { hashPassword, hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, passwordResetSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const tokenValue = String(formData.get("token") ?? "").trim();
    const parsed = await passwordResetSchema.safeParseAsync({
      token: tokenValue,
      newPassword: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL(`/invite?token=${encodeURIComponent(tokenValue)}&error=password`, request.url));
    }

    const { token, newPassword } = await parseRequest(parsed.data, passwordResetSchema);

    const db = await getDb();
    const invite = await db
      .prepare(
        `SELECT invitation_tokens.id, invitation_tokens.user_id
         FROM invitation_tokens
         INNER JOIN users ON users.id = invitation_tokens.user_id
         WHERE invitation_tokens.token_hash = ?
           AND invitation_tokens.used_at IS NULL
           AND invitation_tokens.expires_at > ?
           AND users.status = 'active'
           AND users.deleted_at IS NULL
         LIMIT 1`,
      )
      .bind(await hashToken(token), new Date().toISOString())
      .first<{ id: string; user_id: string }>();

    if (!invite) {
      return NextResponse.redirect(new URL("/invite?error=invalid", request.url));
    }

    const now = new Date().toISOString();
    await db
      .prepare(
        "UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, ?), updated_at = ? WHERE id = ? AND deleted_at IS NULL",
      )
      .bind(await hashPassword(newPassword), now, now, invite.user_id)
      .run();

    await db
      .prepare("UPDATE invitation_tokens SET used_at = ? WHERE id = ?")
      .bind(now, invite.id)
      .run();

    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(invite.user_id).run();
    await logAudit(invite.user_id, "update", "users", invite.user_id, { field: "password_hash" });

    return NextResponse.redirect(new URL("/login?status=password-setup", request.url));
  } catch (error) {
    return handleError(error);
  }
}
