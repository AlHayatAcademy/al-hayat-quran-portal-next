import { NextRequest, NextResponse } from "next/server";
import { hashPassword, hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || password.length < 8 || password !== confirmPassword) {
    return NextResponse.redirect(new URL(`/invite?token=${encodeURIComponent(token)}&error=password`, request.url));
  }

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
       LIMIT 1`,
    )
    .bind(await hashToken(token), new Date().toISOString())
    .first<{ id: string; user_id: string }>();

  if (!invite) {
    return NextResponse.redirect(new URL("/invite?error=invalid", request.url));
  }

  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(await hashPassword(password), invite.user_id)
    .run();

  await db
    .prepare("UPDATE invitation_tokens SET used_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), invite.id)
    .run();

  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(invite.user_id).run();

  return NextResponse.redirect(new URL("/login?status=password-setup", request.url));
}
