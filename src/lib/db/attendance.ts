import { getDb } from "@/lib/db";

export type DbAttendanceRecord = {
  id: string;
  class_session_id: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  notes: string | null;
  marked_by: string | null;
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export async function findAttendanceRecord(classSessionId: string, studentId: string): Promise<DbAttendanceRecord | null> {
  const db = await getDb();
  const record = await db
    .prepare(
      "SELECT * FROM attendance_records WHERE class_session_id = ? AND student_id = ? AND deleted_at IS NULL LIMIT 1",
    )
    .bind(classSessionId, studentId)
    .first<DbAttendanceRecord>();
  return record ?? null;
}

export async function softDeleteAttendanceRecord(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE attendance_records SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
