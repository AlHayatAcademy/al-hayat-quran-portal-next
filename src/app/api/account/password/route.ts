import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { findUserById, updateUserPasswordHash } from "@/lib/db/users";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { accountPasswordSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await accountPasswordSchema.safeParseAsync({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=password", request.url));
    }

    const { currentPassword, newPassword } = await parseRequest(parsed.data, accountPasswordSchema);

    const db = await getDb();
    const account = await findUserById(user.id);

    if (!account || !(await verifyPassword(currentPassword, account.password_hash))) {
      return NextResponse.redirect(new URL("/dashboard?error=password", request.url));
    }

    await updateUserPasswordHash(user.id, await hashPassword(newPassword));

    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id).run();
    await logAudit(user.id, "update", "users", user.id, { field: "password_hash" });

    return NextResponse.redirect(new URL("/login?status=password-updated", request.url));
  } catch (error) {
    return handleError(error);
  }
}
