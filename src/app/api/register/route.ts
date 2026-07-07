import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEmailVerificationEmail } from "@/lib/email";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { createEmailVerificationToken } from "@/lib/utils/email-verification";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, registerSchema } from "@/lib/utils/schemas";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await registerSchema.safeParseAsync({
      parentName: formData.get("parentName"),
      parentEmail: formData.get("parentEmail"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      studentName: formData.get("studentName"),
      studentAge: formData.get("studentAge"),
      courseTitle: formData.get("courseTitle"),
      learningGoal: formData.get("learningGoal"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/register?error=missing", request.url));
    }

    const { parentName, parentEmail, phone, password, studentName, studentAge, courseTitle, learningGoal } =
      await parseRequest(parsed.data, registerSchema);

    const db = await getDb();
    const existing = await db
      .prepare("SELECT id FROM users WHERE lower(email) = ? AND deleted_at IS NULL LIMIT 1")
      .bind(parentEmail)
      .first();

    if (existing) {
      return NextResponse.redirect(new URL("/register?error=exists", request.url));
    }

    const parentId = crypto.randomUUID();
    const studentId = crypto.randomUUID();
    const courseId = `course_${slugify(courseTitle)}`;
    const studentEmail = `${studentId}@student.alhayat.local`;
    const parentPasswordHash = await hashPassword(password);
    const studentPasswordHash = await hashPassword(crypto.randomUUID());
    const learningGoalNotes = [learningGoal, phone ? `Phone: ${phone}` : "", studentAge ? `Age: ${studentAge}` : ""]
      .filter(Boolean)
      .join("\n");

    await db.batch([
      db
        .prepare("INSERT OR IGNORE INTO courses (id, title, description, level, status) VALUES (?, ?, ?, ?, 'active')")
        .bind(courseId, courseTitle, `${courseTitle} enrollment course.`, "Enrollment"),
      db
        .prepare(
          `INSERT INTO users (id, name, email, password_hash, role, status, locale)
           VALUES (?, ?, ?, ?, 'parent', 'active', 'en')`,
        )
        .bind(parentId, parentName, parentEmail, parentPasswordHash),
      db
        .prepare(
          `INSERT INTO users (id, name, email, password_hash, role, status, locale, email_verified_at)
           VALUES (?, ?, ?, ?, 'student', 'active', 'en', ?)`,
        )
        .bind(studentId, studentName, studentEmail, studentPasswordHash, new Date().toISOString()),
      db
        .prepare(
          `INSERT INTO student_profiles (id, user_id, parent_id, course_id, learning_goal)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(crypto.randomUUID(), studentId, parentId, courseId, learningGoalNotes),
    ]);
    const verification = await createEmailVerificationToken(parentId);
    const verifyUrl = new URL(`/api/auth/verify-email?token=${verification.token}`, request.url).toString();
    const emailResult = await sendEmailVerificationEmail({
      to: parentEmail,
      name: parentName,
      verifyUrl,
    });
    await logAudit(parentId, "create", "users", parentId, { role: "parent" });
    await logAudit(parentId, "create", "users", studentId, { role: "student" });

    const redirectUrl = new URL("/register", request.url);
    redirectUrl.searchParams.set("status", "registered");
    redirectUrl.searchParams.set("emailStatus", emailResult.sent ? "sent" : emailResult.reason);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return handleError(error);
  }
}
