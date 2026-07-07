import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");

  const formData = await request.formData();
  const classSessionId = String(formData.get("classSessionId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "").trim();
  const status = String(formData.get("status") ?? "assigned").trim();

  if (!teacherId || !studentId || !title) {
    return NextResponse.redirect(new URL("/admin?error=homework", request.url));
  }

  const dueAtIso = dueAt ? new Date(dueAt).toISOString() : null;
  const db = await getDb();

  await db
    .prepare(
      `INSERT INTO homework_items
        (id, class_session_id, teacher_id, student_id, title, instructions, due_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      classSessionId || null,
      teacherId,
      studentId,
      title,
      instructions || null,
      dueAtIso,
      status || "assigned",
    )
    .run();

  return NextResponse.redirect(new URL("/admin?status=homework-assigned", request.url));
}
