import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/teacher/classes
 * @returns {ApiResponse<{ classes: unknown[] }>}
 */
export async function GET() {
  try {
    const teacher = await requireApiRole("teacher");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT classes.id, classes.course_id, classes.teacher_id, classes.student_id,
                classes.starts_at, classes.meeting_provider, classes.meeting_url,
                classes.status, classes.updated_at,
                courses.title AS course_title,
                students.name AS student_name, students.email AS student_email
         FROM class_sessions classes
         INNER JOIN courses
           ON courses.id = classes.course_id
          AND courses.deleted_at IS NULL
         LEFT JOIN users students
           ON students.id = classes.student_id
          AND students.deleted_at IS NULL
         WHERE classes.teacher_id = ?
           AND classes.deleted_at IS NULL
         ORDER BY classes.starts_at ASC`,
      )
      .bind(teacher.id)
      .all();

    return createApiResponse({ classes: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}
