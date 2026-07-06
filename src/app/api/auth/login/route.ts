import { NextRequest, NextResponse } from "next/server";
import { createSession, dashboardPathForRole, verifyPassword, UserRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

type LoginUser = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: string;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url));
  }

  const db = await getDb();
  const user = await db
    .prepare("SELECT id, email, password_hash, role, status FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(email)
    .first<LoginUser>();

  if (!user || user.status !== "active" || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const session = await createSession(user.id);
  const response = NextResponse.redirect(new URL(dashboardPathForRole(user.role), request.url));

  response.cookies.set("alhayat_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return response;
}
