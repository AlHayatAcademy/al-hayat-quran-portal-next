import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";

/**
 * GET /api/teacher/students
 * @returns {ApiResponse<{ students: unknown[] }>}
 */
export async function GET() {
  try {
    const teacher = await requireApiRole("teacher");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT sp.id AS profile_id, sp.user_id AS student_id, sp.parent_id,
                sp.course_id, sp.learning_goal, sp.updated_at, sp.created_at,
                students.name AS student_name, students.email AS student_email,
                parents.name AS parent_name, parents.email AS parent_email,
                courses.title AS course_title, courses.level AS course_level
         FROM student_profiles sp
         INNER JOIN users students
           ON students.id = sp.user_id
          AND students.deleted_at IS NULL
         LEFT JOIN users parents
           ON parents.id = sp.parent_id
          AND parents.deleted_at IS NULL
         LEFT JOIN courses
           ON courses.id = sp.course_id
          AND courses.deleted_at IS NULL
         WHERE sp.teacher_id = ?
           AND sp.deleted_at IS NULL
         ORDER BY students.name ASC`,
      )
      .bind(teacher.id)
      .all();

    return createApiResponse({ students: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}
