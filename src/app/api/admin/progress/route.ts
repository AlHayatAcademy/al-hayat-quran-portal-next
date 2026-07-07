import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, progressUpdateSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await progressUpdateSchema.safeParseAsync({
      studentId: formData.get("studentId"),
      courseId: formData.get("courseId"),
      teacherId: formData.get("teacherId"),
      milestone: formData.get("milestone"),
      completionPercent: formData.get("completionPercent"),
      notes: formData.get("notes"),
    });

    if (!parsed.success || !parsed.data.teacherId) {
      return NextResponse.redirect(new URL("/admin?error=progress", request.url));
    }

    const { studentId, courseId, teacherId, milestone, completionPercent, notes } = await parseRequest(
      parsed.data,
      progressUpdateSchema,
    );
    const db = await getDb();

    const progressId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO lesson_progress
          (id, student_id, course_id, teacher_id, milestone, completion_percent, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(progressId, studentId, courseId, teacherId, milestone, Math.round(completionPercent), notes || null)
      .run();
    await logAudit(admin.id, "create", "lesson_progress", progressId, { studentId, courseId, teacherId });

    return NextResponse.redirect(new URL("/admin?status=progress-saved", request.url));
  } catch (error) {
    return handleError(error);
  }
}
