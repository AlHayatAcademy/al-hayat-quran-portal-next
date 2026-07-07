import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await requireRole("admin");

  const formData = await request.formData();
  const classSessionId = String(formData.get("classSessionId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const status = String(formData.get("status") ?? "present").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!classSessionId || !studentId || !["present", "absent", "late", "excused"].includes(status)) {
    return NextResponse.redirect(new URL("/admin?error=attendance", request.url));
  }

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO attendance_records (id, class_session_id, student_id, status, notes, marked_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), classSessionId, studentId, status, notes || null, user.id)
    .run();

  await db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").bind(classSessionId).run();

  return NextResponse.redirect(new URL("/admin?status=attendance-marked", request.url));
}
