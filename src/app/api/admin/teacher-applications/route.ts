import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createPasswordSetupInvite } from "@/lib/invitations";

export async function POST(request: NextRequest) {
  const admin = await requireRole("admin");

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const action = String(formData.get("action") ?? "");

  if (!email || !["approve", "reject"].includes(action)) {
    return NextResponse.redirect(new URL("/admin?error=application", request.url));
  }

  const db = await getDb();
  const application = await db
    .prepare("SELECT name, email FROM teacher_applications WHERE lower(email) = ? LIMIT 1")
    .bind(email)
    .first<{ name: string; email: string }>();

  if (!application) {
    return NextResponse.redirect(new URL("/admin?error=missing-application", request.url));
  }

  if (action === "reject") {
    await db.prepare("UPDATE teacher_applications SET status = 'rejected' WHERE lower(email) = ?").bind(email).run();
    return NextResponse.redirect(new URL("/admin?status=rejected", request.url));
  }

  const existingUser = await db
    .prepare("SELECT id FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(email)
    .first<{ id: string }>();
  let teacherId = existingUser?.id;

  if (!teacherId) {
    teacherId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, status, locale)
         VALUES (?, ?, ?, ?, 'teacher', 'active', 'en')`,
      )
      .bind(teacherId, application.name, application.email, await hashPassword(crypto.randomUUID()))
      .run();
  }

  const invite = await createPasswordSetupInvite(teacherId, admin.id);
  const redirectUrl = new URL("/admin", request.url);
  redirectUrl.searchParams.set("status", "approved");
  redirectUrl.searchParams.set("invite", invite.token);
  redirectUrl.searchParams.set("email", application.email);

  await db.prepare("UPDATE teacher_applications SET status = 'approved' WHERE lower(email) = ?").bind(email).run();
  return NextResponse.redirect(redirectUrl);
}
