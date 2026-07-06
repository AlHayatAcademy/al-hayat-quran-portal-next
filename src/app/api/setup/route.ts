import { NextRequest, NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { getCloudflareEnv, getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const setupToken = String(formData.get("setupToken") ?? "");

  if (!name || !email || !password || !setupToken) {
    return NextResponse.redirect(new URL("/setup?error=missing", request.url));
  }

  if (password.length < 10) {
    return NextResponse.redirect(new URL("/setup?error=password", request.url));
  }

  const env = await getCloudflareEnv();

  if (!env.SETUP_TOKEN || setupToken !== env.SETUP_TOKEN) {
    return NextResponse.redirect(new URL("/setup?error=token", request.url));
  }

  const db = await getDb();
  const existingAdmin = await db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").first<{ id: string }>();

  if (existingAdmin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, role, status, locale)
       VALUES (?, ?, ?, ?, 'admin', 'active', 'en')`,
    )
    .bind(userId, name, email, await hashPassword(password))
    .run();

  const session = await createSession(userId);
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("alhayat_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return response;
}
