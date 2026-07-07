import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const teacher = await requireRole("teacher");

  const formData = await request.formData();
  const classSessionId = String(formData.get("classSessionId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "").trim();

  if (!studentId || !title) {
    return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
  }

  const db = await getDb();
  const assignedStudent = await db
    .prepare("SELECT id FROM student_profiles WHERE user_id = ? AND teacher_id = ? LIMIT 1")
    .bind(studentId, teacher.id)
    .first<{ id: string }>();

  if (!assignedStudent) {
    return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
  }

  if (classSessionId) {
    const classSession = await db
      .prepare("SELECT id FROM class_sessions WHERE id = ? AND teacher_id = ? LIMIT 1")
      .bind(classSessionId, teacher.id)
      .first<{ id: string }>();

    if (!classSession) {
      return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
    }
  }

  const dueAtDate = dueAt ? new Date(dueAt) : null;
  if (dueAtDate && Number.isNaN(dueAtDate.getTime())) {
    return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
  }

  const dueAtIso = dueAtDate ? dueAtDate.toISOString() : null;

  await db
    .prepare(
      `INSERT INTO homework_items
        (id, class_session_id, teacher_id, student_id, title, instructions, due_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned')`,
    )
    .bind(crypto.randomUUID(), classSessionId || null, teacher.id, studentId, title, instructions || null, dueAtIso)
    .run();

  return NextResponse.redirect(new URL("/dashboard?status=homework-assigned", request.url));
}
