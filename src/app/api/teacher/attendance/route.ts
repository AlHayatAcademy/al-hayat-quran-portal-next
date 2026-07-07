import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";
import { parseRequest, teacherAttendanceSchema } from "@/lib/utils/schemas";

/**
 * GET /api/teacher/attendance
 * @returns {ApiResponse<{ attendance: unknown[] }>}
 */
export async function GET() {
  try {
    const teacher = await requireApiRole("teacher");
    const db = await getDb();
    const result = await db
      .prepare(
        `SELECT attendance.id, attendance.class_session_id, attendance.student_id,
                attendance.status, attendance.notes, attendance.marked_by,
                attendance.updated_at, attendance.created_at,
                classes.starts_at, classes.status AS class_status,
                courses.title AS course_title,
                students.name AS student_name
         FROM attendance_records attendance
         INNER JOIN class_sessions classes
           ON classes.id = attendance.class_session_id
          AND classes.teacher_id = ?
          AND classes.deleted_at IS NULL
         INNER JOIN users students
           ON students.id = attendance.student_id
          AND students.deleted_at IS NULL
         INNER JOIN courses
           ON courses.id = classes.course_id
          AND courses.deleted_at IS NULL
         WHERE attendance.marked_by = ?
           AND attendance.deleted_at IS NULL
         ORDER BY attendance.created_at DESC`,
      )
      .bind(teacher.id, teacher.id)
      .all();

    return createApiResponse({ attendance: result.results ?? [] });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireApiRole("teacher");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await teacherAttendanceSchema.safeParseAsync({
      classSessionId: formData.get("classSessionId"),
      status: formData.get("status") || "present",
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=attendance", request.url));
    }

    const { classSessionId, status, notes } = await parseRequest(parsed.data, teacherAttendanceSchema);
    const db = await getDb();
    const classSession = await db
      .prepare("SELECT id, student_id FROM class_sessions WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL LIMIT 1")
      .bind(classSessionId, teacher.id)
      .first<{ id: string; student_id: string | null }>();

    if (!classSession?.student_id) {
      return NextResponse.redirect(new URL("/dashboard?error=attendance", request.url));
    }

    const existingRecord = await db
      .prepare(
        "SELECT id FROM attendance_records WHERE class_session_id = ? AND student_id = ? AND deleted_at IS NULL LIMIT 1",
      )
      .bind(classSession.id, classSession.student_id)
      .first<{ id: string }>();

    if (existingRecord) {
      await db
        .prepare("UPDATE attendance_records SET status = ?, notes = ?, marked_by = ?, updated_at = ? WHERE id = ?")
        .bind(status, notes || null, teacher.id, new Date().toISOString(), existingRecord.id)
        .run();
      await logAudit(teacher.id, "update", "attendance_records", existingRecord.id, { status });
    } else {
      const attendanceId = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO attendance_records (id, class_session_id, student_id, status, notes, marked_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(attendanceId, classSession.id, classSession.student_id, status, notes || null, teacher.id)
        .run();
      await logAudit(teacher.id, "create", "attendance_records", attendanceId, { status });
    }

    await db
      .prepare("UPDATE class_sessions SET status = 'completed', updated_at = ? WHERE id = ? AND deleted_at IS NULL")
      .bind(new Date().toISOString(), classSession.id)
      .run();

    return NextResponse.redirect(new URL("/dashboard?status=attendance-marked", request.url));
  } catch (error) {
    return handleError(error);
  }
}
