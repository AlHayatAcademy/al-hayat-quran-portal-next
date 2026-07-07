import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createPasswordSetupInvite } from "@/lib/invitations";

export async function POST(request: NextRequest) {
  const admin = await requireRole("admin");
  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return NextResponse.redirect(new URL("/admin?error=invite", request.url));
  }

  const db = await getDb();
  const user = await db
    .prepare("SELECT id, email FROM users WHERE id = ? AND status = 'active' LIMIT 1")
    .bind(userId)
    .first<{ id: string; email: string }>();

  if (!user) {
    return NextResponse.redirect(new URL("/admin?error=invite", request.url));
  }

  const invite = await createPasswordSetupInvite(user.id, admin.id);
  const redirectUrl = new URL("/admin", request.url);
  redirectUrl.searchParams.set("status", "invite-created");
  redirectUrl.searchParams.set("invite", invite.token);
  redirectUrl.searchParams.set("email", user.email);

  return NextResponse.redirect(redirectUrl);
}
