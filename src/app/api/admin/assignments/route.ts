import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { assignmentSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await assignmentSchema.safeParseAsync({
      studentId: formData.get("studentId"),
      teacherId: formData.get("teacherId"),
      courseId: formData.get("courseId"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=assignment", request.url));
    }

    const { studentId, teacherId, courseId } = await parseRequest(parsed.data, assignmentSchema);

    const db = await getDb();
    const profile = await db
      .prepare("SELECT id FROM student_profiles WHERE user_id = ? AND deleted_at IS NULL LIMIT 1")
      .bind(studentId)
      .first<{ id: string }>();

    if (profile) {
      await db
        .prepare("UPDATE student_profiles SET teacher_id = ?, course_id = ?, updated_at = ? WHERE user_id = ?")
        .bind(teacherId, courseId, new Date().toISOString(), studentId)
        .run();
      await logAudit(admin.id, "update", "student_profiles", profile.id, { studentId, teacherId, courseId });
    } else {
      const profileId = crypto.randomUUID();
      await db
        .prepare("INSERT INTO student_profiles (id, user_id, teacher_id, course_id) VALUES (?, ?, ?, ?)")
        .bind(profileId, studentId, teacherId, courseId)
        .run();
      await logAudit(admin.id, "create", "student_profiles", profileId, { studentId, teacherId, courseId });
    }

    return NextResponse.redirect(new URL("/admin?status=assigned", request.url));
  } catch (error) {
    return handleError(error);
  }
}
