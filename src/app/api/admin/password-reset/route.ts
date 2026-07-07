import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const admin = await requireRole("admin");
  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!userId || password.length < 8 || password !== confirmPassword) {
    return NextResponse.redirect(new URL("/admin?error=password-reset", request.url));
  }

  const db = await getDb();
  const targetUser = await db
    .prepare("SELECT id FROM users WHERE id = ? AND status = 'active' LIMIT 1")
    .bind(userId)
    .first<{ id: string }>();

  if (!targetUser) {
    return NextResponse.redirect(new URL("/admin?error=password-reset", request.url));
  }

  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(await hashPassword(password), userId)
    .run();

  await db.prepare("DELETE FROM sessions WHERE user_id = ? AND user_id <> ?").bind(userId, admin.id).run();

  return NextResponse.redirect(new URL("/admin?status=password-reset", request.url));
}
