import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";
import { parseRequest, progressUpdateSchema } from "@/lib/utils/schemas";

/**
 * GET /api/teacher/progress
 * @returns {ApiResponse<{ progress: unknown[] }>}
 */
export async function GET() {
  try {
    const teacher = await requireApiRole("teacher");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT progress.id, progress.student_id, progress.course_id, progress.teacher_id,
                progress.milestone, progress.completion_percent, progress.notes,
                progress.updated_at, progress.created_at,
                students.name AS student_name,
                courses.title AS course_title
         FROM lesson_progress progress
         INNER JOIN student_profiles sp
           ON sp.user_id = progress.student_id
          AND sp.teacher_id = ?
          AND sp.course_id = progress.course_id
          AND sp.deleted_at IS NULL
         INNER JOIN users students
           ON students.id = progress.student_id
          AND students.deleted_at IS NULL
         INNER JOIN courses
           ON courses.id = progress.course_id
          AND courses.deleted_at IS NULL
         WHERE progress.teacher_id = ?
           AND progress.deleted_at IS NULL
         ORDER BY progress.created_at DESC`,
      )
      .bind(teacher.id, teacher.id)
      .all();

    return createApiResponse({ progress: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireApiRole("teacher");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await progressUpdateSchema.safeParseAsync({
      studentId: formData.get("studentId"),
      courseId: formData.get("courseId"),
      milestone: formData.get("milestone"),
      completionPercent: formData.get("completionPercent"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=progress", request.url));
    }

    const { studentId, courseId, milestone, completionPercent, notes } = await parseRequest(
      parsed.data,
      progressUpdateSchema,
    );

    const db = await getDb();
    const assignedStudent = await db
      .prepare(
        "SELECT id FROM student_profiles WHERE user_id = ? AND teacher_id = ? AND course_id = ? AND deleted_at IS NULL LIMIT 1",
      )
      .bind(studentId, teacher.id, courseId)
      .first<{ id: string }>();

    if (!assignedStudent) {
      return NextResponse.redirect(new URL("/dashboard?error=progress", request.url));
    }

    const progressId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO lesson_progress
          (id, student_id, course_id, teacher_id, milestone, completion_percent, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(progressId, studentId, courseId, teacher.id, milestone, Math.round(completionPercent), notes || null)
      .run();
    await logAudit(teacher.id, "create", "lesson_progress", progressId, { studentId, courseId });

    return NextResponse.redirect(new URL("/dashboard?status=progress-saved", request.url));
  } catch (error) {
    return handleError(error);
  }
}
