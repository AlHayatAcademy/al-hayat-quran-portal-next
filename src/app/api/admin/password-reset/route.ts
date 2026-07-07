import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { adminPasswordResetSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await adminPasswordResetSchema.safeParseAsync({
      userId: formData.get("userId"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=password-reset", request.url));
    }

    const { userId, password } = await parseRequest(parsed.data, adminPasswordResetSchema);

    const db = await getDb();
    const targetUser = await db
      .prepare("SELECT id FROM users WHERE id = ? AND status = 'active' AND deleted_at IS NULL LIMIT 1")
      .bind(userId)
      .first<{ id: string }>();

    if (!targetUser) {
      return NextResponse.redirect(new URL("/admin?error=password-reset", request.url));
    }

    await db
      .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
      .bind(await hashPassword(password), new Date().toISOString(), userId)
      .run();

    await db.prepare("DELETE FROM sessions WHERE user_id = ? AND user_id <> ?").bind(userId, admin.id).run();
    await logAudit(admin.id, "update", "users", userId, { field: "password_hash" });

    return NextResponse.redirect(new URL("/admin?status=password-reset", request.url));
  } catch (error) {
    return handleError(error);
  }
}
