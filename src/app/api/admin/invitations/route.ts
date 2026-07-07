import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendPasswordSetupEmail } from "@/lib/email";
import { createPasswordSetupInvite } from "@/lib/invitations";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, userInviteSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await userInviteSchema.safeParseAsync({
      userId: formData.get("userId"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=invite", request.url));
    }

    const { userId } = await parseRequest(parsed.data, userInviteSchema);

    const db = await getDb();
    const user = await db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ? AND status = 'active' AND deleted_at IS NULL LIMIT 1")
      .bind(userId)
      .first<{ id: string; name: string; email: string; role: string }>();

    if (!user) {
      return NextResponse.redirect(new URL("/admin?error=invite", request.url));
    }

    const invite = await createPasswordSetupInvite(user.id, admin.id);
    await logAudit(admin.id, "create", "invitation_tokens", invite.id, { userId: user.id, role: user.role });
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
  } catch (error) {
    return handleError(error);
  }
}
