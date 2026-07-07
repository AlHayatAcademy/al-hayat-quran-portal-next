import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/student/classes
 * @returns {ApiResponse<{ classes: unknown[] }>}
 */
export async function GET() {
  try {
    const student = await requireApiRole("student");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT classes.id, classes.course_id, classes.teacher_id, classes.student_id,
                classes.starts_at, classes.meeting_provider, classes.meeting_url,
                classes.status, classes.updated_at,
                courses.title AS course_title,
                teachers.name AS teacher_name
         FROM class_sessions classes
         INNER JOIN courses
           ON courses.id = classes.course_id
          AND courses.deleted_at IS NULL
         INNER JOIN users teachers
           ON teachers.id = classes.teacher_id
          AND teachers.deleted_at IS NULL
         WHERE classes.student_id = ?
           AND classes.deleted_at IS NULL
         ORDER BY classes.starts_at ASC`,
      )
      .bind(student.id)
      .all();

    return createApiResponse({ classes: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}
