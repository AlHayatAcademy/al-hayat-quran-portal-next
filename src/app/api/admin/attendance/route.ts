import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { attendanceSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await attendanceSchema.safeParseAsync({
      classSessionId: formData.get("classSessionId"),
      studentId: formData.get("studentId"),
      status: formData.get("status") || "present",
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=attendance", request.url));
    }

    const { classSessionId, studentId, status, notes } = await parseRequest(parsed.data, attendanceSchema);

    const db = await getDb();
    const existingRecord = await db
      .prepare(
        "SELECT id FROM attendance_records WHERE class_session_id = ? AND student_id = ? AND deleted_at IS NULL LIMIT 1",
      )
      .bind(classSessionId, studentId)
      .first<{ id: string }>();

    if (existingRecord) {
      await db
        .prepare("UPDATE attendance_records SET status = ?, notes = ?, marked_by = ?, updated_at = ? WHERE id = ?")
        .bind(status, notes || null, user.id, new Date().toISOString(), existingRecord.id)
        .run();
      await logAudit(user.id, "update", "attendance_records", existingRecord.id, { classSessionId, studentId, status });
    } else {
      const attendanceId = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO attendance_records (id, class_session_id, student_id, status, notes, marked_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(attendanceId, classSessionId, studentId, status, notes || null, user.id)
        .run();
      await logAudit(user.id, "create", "attendance_records", attendanceId, { classSessionId, studentId, status });
    }

    await db
      .prepare("UPDATE class_sessions SET status = 'completed', updated_at = ? WHERE id = ? AND deleted_at IS NULL")
      .bind(new Date().toISOString(), classSessionId)
      .run();

    return NextResponse.redirect(new URL("/admin?status=attendance-marked", request.url));
  } catch (error) {
    return handleError(error);
  }
}
