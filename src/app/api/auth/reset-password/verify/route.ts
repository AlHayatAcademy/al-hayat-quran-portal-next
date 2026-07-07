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
      return NextResponse.redirect(new URL(`/reset-password?token=${encodeURIComponent(tokenValue)}&error=password`, request.url));
    }

    const { token, newPassword } = await parseRequest(parsed.data, passwordResetSchema);
    const db = await getDb();
    const reset = await db
      .prepare(
        `SELECT password_reset_tokens.id, password_reset_tokens.user_id
         FROM password_reset_tokens
         INNER JOIN users ON users.id = password_reset_tokens.user_id
         WHERE password_reset_tokens.token_hash = ?
           AND password_reset_tokens.used_at IS NULL
           AND password_reset_tokens.expires_at > ?
           AND users.status = 'active'
           AND users.deleted_at IS NULL
         LIMIT 1`,
      )
      .bind(await hashToken(token), new Date().toISOString())
      .first<{ id: string; user_id: string }>();

    if (!reset) {
      return NextResponse.redirect(new URL("/reset-password?error=invalid", request.url));
    }

    await db
      .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
      .bind(await hashPassword(newPassword), new Date().toISOString(), reset.user_id)
      .run();
    await db.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE id = ?").bind(new Date().toISOString(), reset.id).run();
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(reset.user_id).run();
    await logAudit(reset.user_id, "update", "users", reset.user_id, { field: "password_hash" });

    return NextResponse.redirect(new URL("/login?status=password-reset", request.url));
  } catch (error) {
    return handleError(error);
  }
}
