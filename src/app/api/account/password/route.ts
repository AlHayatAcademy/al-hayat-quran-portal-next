import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
    return NextResponse.redirect(new URL("/dashboard?error=password", request.url));
  }

  const db = await getDb();
  const account = await db
    .prepare("SELECT password_hash FROM users WHERE id = ? AND status = 'active' LIMIT 1")
    .bind(user.id)
    .first<{ password_hash: string }>();

  if (!account || !(await verifyPassword(currentPassword, account.password_hash))) {
    return NextResponse.redirect(new URL("/dashboard?error=password", request.url));
  }

  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(await hashPassword(newPassword), user.id)
    .run();

  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id).run();

  return NextResponse.redirect(new URL("/login?status=password-updated", request.url));
}
