import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendPasswordSetupEmail } from "@/lib/email";
import { createPasswordSetupInvite } from "@/lib/invitations";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, teacherApplicationActionSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await teacherApplicationActionSchema.safeParseAsync({
      email: formData.get("email"),
      action: formData.get("action"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=application", request.url));
    }

    const { email, action } = await parseRequest(parsed.data, teacherApplicationActionSchema);

    const db = await getDb();
    const application = await db
      .prepare("SELECT name, email FROM teacher_applications WHERE lower(email) = ? AND deleted_at IS NULL LIMIT 1")
      .bind(email)
      .first<{ name: string; email: string }>();

    if (!application) {
      return NextResponse.redirect(new URL("/admin?error=missing-application", request.url));
    }

    if (action === "reject") {
      await db
        .prepare(
          "UPDATE teacher_applications SET status = 'rejected', reviewed_by = ?, updated_at = ? WHERE lower(email) = ? AND deleted_at IS NULL",
        )
        .bind(admin.id, new Date().toISOString(), email)
        .run();
      await logAudit(admin.id, "update", "teacher_applications", email, { status: "rejected" });
      return NextResponse.redirect(new URL("/admin?status=rejected", request.url));
    }

    const existingUser = await db
      .prepare("SELECT id FROM users WHERE lower(email) = ? AND deleted_at IS NULL LIMIT 1")
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
    await logAudit(admin.id, "create", "invitation_tokens", invite.id, { userId: teacherId, role: "teacher" });
    const redirectUrl = new URL("/admin", request.url);
    const setupUrl = new URL(`/invite?token=${invite.token}`, request.url).toString();
    const emailResult = await sendPasswordSetupEmail({
      to: application.email,
      name: application.name,
      role: "teacher",
      setupUrl,
    });

    redirectUrl.searchParams.set("status", "approved");
    redirectUrl.searchParams.set("invite", invite.token);
    redirectUrl.searchParams.set("email", application.email);
    redirectUrl.searchParams.set("emailStatus", emailResult.sent ? "sent" : emailResult.reason);

    await db
      .prepare(
        "UPDATE teacher_applications SET status = 'approved', reviewed_by = ?, updated_at = ? WHERE lower(email) = ? AND deleted_at IS NULL",
      )
      .bind(admin.id, new Date().toISOString(), email)
      .run();
    await logAudit(admin.id, "update", "teacher_applications", email, { status: "approved" });
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return handleError(error);
  }
}
