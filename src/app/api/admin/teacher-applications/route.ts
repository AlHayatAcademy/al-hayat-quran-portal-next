import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");

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

  const existingUser = await db.prepare("SELECT id FROM users WHERE lower(email) = ? LIMIT 1").bind(email).first();

  if (!existingUser) {
    await db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, status, locale)
         VALUES (?, ?, ?, ?, 'teacher', 'active', 'en')`,
      )
      .bind(crypto.randomUUID(), application.name, application.email, await hashPassword(crypto.randomUUID()))
      .run();
  }

  await db.prepare("UPDATE teacher_applications SET status = 'approved' WHERE lower(email) = ?").bind(email).run();
  return NextResponse.redirect(new URL("/admin?status=approved", request.url));
}
