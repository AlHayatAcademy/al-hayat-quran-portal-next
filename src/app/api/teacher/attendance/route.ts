import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const teacher = await requireRole("teacher");

  const formData = await request.formData();
  const classSessionId = String(formData.get("classSessionId") ?? "").trim();
  const status = String(formData.get("status") ?? "present").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!classSessionId || !["present", "absent", "late", "excused"].includes(status)) {
    return NextResponse.redirect(new URL("/dashboard?error=attendance", request.url));
  }

  const db = await getDb();
  const classSession = await db
    .prepare("SELECT id, student_id FROM class_sessions WHERE id = ? AND teacher_id = ? LIMIT 1")
    .bind(classSessionId, teacher.id)
    .first<{ id: string; student_id: string | null }>();

  if (!classSession?.student_id) {
    return NextResponse.redirect(new URL("/dashboard?error=attendance", request.url));
  }

  const existingRecord = await db
    .prepare("SELECT id FROM attendance_records WHERE class_session_id = ? AND student_id = ? LIMIT 1")
    .bind(classSession.id, classSession.student_id)
    .first<{ id: string }>();

  if (existingRecord) {
    await db
      .prepare("UPDATE attendance_records SET status = ?, notes = ?, marked_by = ? WHERE id = ?")
      .bind(status, notes || null, teacher.id, existingRecord.id)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO attendance_records (id, class_session_id, student_id, status, notes, marked_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), classSession.id, classSession.student_id, status, notes || null, teacher.id)
      .run();
  }

  await db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").bind(classSession.id).run();

  return NextResponse.redirect(new URL("/dashboard?status=attendance-marked", request.url));
}
