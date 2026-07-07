import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireTeacherOwnsStudent } from "@/lib/utils/authorization";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";
import { homeworkCreateSchema, parseRequest } from "@/lib/utils/schemas";

/**
 * GET /api/teacher/homework
 * @returns {ApiResponse<{ homework: unknown[] }>}
 */
export async function GET() {
  try {
    const teacher = await requireApiRole("teacher");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT h.id, h.class_session_id, h.teacher_id, h.student_id, h.title, h.instructions,
                h.due_at, h.status, h.feedback, h.updated_at, h.created_at,
                students.name AS student_name,
                courses.title AS course_title,
                classes.starts_at AS class_starts_at
         FROM homework_items h
         INNER JOIN student_profiles sp
           ON sp.user_id = h.student_id
          AND sp.teacher_id = ?
          AND sp.deleted_at IS NULL
         INNER JOIN users students
           ON students.id = h.student_id
          AND students.deleted_at IS NULL
         LEFT JOIN class_sessions classes
           ON classes.id = h.class_session_id
          AND classes.deleted_at IS NULL
         LEFT JOIN courses
           ON courses.id = classes.course_id
          AND courses.deleted_at IS NULL
         WHERE h.teacher_id = ?
           AND h.deleted_at IS NULL
         ORDER BY COALESCE(h.due_at, h.created_at) DESC`,
      )
      .bind(teacher.id, teacher.id)
      .all();

    return createApiResponse({ homework: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireApiRole("teacher");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await homeworkCreateSchema.safeParseAsync({
      classSessionId: formData.get("classSessionId"),
      studentId: formData.get("studentId"),
      title: formData.get("title"),
      instructions: formData.get("instructions"),
      dueAt: formData.get("dueAt"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
    }

    const { classSessionId, studentId, title, instructions, dueAt } = await parseRequest(
      parsed.data,
      homeworkCreateSchema,
    );
    const db = await getDb();
    await requireTeacherOwnsStudent(teacher.id, studentId);

    if (classSessionId) {
      const classSession = await db
        .prepare("SELECT id FROM class_sessions WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL LIMIT 1")
        .bind(classSessionId, teacher.id)
        .first<{ id: string }>();

      if (!classSession) {
        return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
      }
    }

    const dueAtIso = dueAt ? new Date(dueAt).toISOString() : null;

    const homeworkId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO homework_items
          (id, class_session_id, teacher_id, student_id, title, instructions, due_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned')`,
      )
      .bind(homeworkId, classSessionId || null, teacher.id, studentId, title, instructions || null, dueAtIso)
      .run();
    await logAudit(teacher.id, "create", "homework_items", homeworkId, { studentId, title });

    return NextResponse.redirect(new URL("/dashboard?status=homework-assigned", request.url));
  } catch (error) {
    return handleError(error);
  }
}
