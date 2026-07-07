import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendPasswordSetupEmail } from "@/lib/email";
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
    .prepare("SELECT id, name, email, role FROM users WHERE id = ? AND status = 'active' LIMIT 1")
    .bind(userId)
    .first<{ id: string; name: string; email: string; role: string }>();

  if (!user) {
    return NextResponse.redirect(new URL("/admin?error=invite", request.url));
  }

  const invite = await createPasswordSetupInvite(user.id, admin.id);
  const redirectUrl = new URL("/admin", request.url);
  const setupUrl = new URL(`/invite?token=${invite.token}`, request.url).toString();
  const emailResult = await sendPasswordSetupEmail({
    to: user.email,
    name: user.name,
    role: user.role,
    setupUrl,
  });

  redirectUrl.searchParams.set("status", "invite-created");
  redirectUrl.searchParams.set("invite", invite.token);
  redirectUrl.searchParams.set("email", user.email);
  redirectUrl.searchParams.set("emailStatus", emailResult.sent ? "sent" : emailResult.reason);

  return NextResponse.redirect(redirectUrl);
}
