import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/student/progress
 * @returns {ApiResponse<{ progress: unknown[] }>}
 */
export async function GET() {
  try {
    const student = await requireApiRole("student");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT progress.id, progress.student_id, progress.course_id, progress.teacher_id,
                progress.milestone, progress.completion_percent, progress.notes,
                progress.updated_at, progress.created_at,
                courses.title AS course_title,
                teachers.name AS teacher_name
         FROM lesson_progress progress
         INNER JOIN courses
           ON courses.id = progress.course_id
          AND courses.deleted_at IS NULL
         INNER JOIN users teachers
           ON teachers.id = progress.teacher_id
          AND teachers.deleted_at IS NULL
         WHERE progress.student_id = ?
           AND progress.deleted_at IS NULL
         ORDER BY progress.created_at DESC`,
      )
      .bind(student.id)
      .all();

    return createApiResponse({ progress: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}
