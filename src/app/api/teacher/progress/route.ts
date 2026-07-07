import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const teacher = await requireRole("teacher");

  const formData = await request.formData();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const milestone = String(formData.get("milestone") ?? "").trim();
  const completionPercentValue = Number(formData.get("completionPercent") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!studentId || !courseId || !milestone || Number.isNaN(completionPercentValue)) {
    return NextResponse.redirect(new URL("/dashboard?error=progress", request.url));
  }

  const db = await getDb();
  const assignedStudent = await db
    .prepare("SELECT id FROM student_profiles WHERE user_id = ? AND teacher_id = ? AND course_id = ? LIMIT 1")
    .bind(studentId, teacher.id, courseId)
    .first<{ id: string }>();

  if (!assignedStudent) {
    return NextResponse.redirect(new URL("/dashboard?error=progress", request.url));
  }

  const completionPercent = Math.min(100, Math.max(0, Math.round(completionPercentValue)));

  await db
    .prepare(
      `INSERT INTO lesson_progress
        (id, student_id, course_id, teacher_id, milestone, completion_percent, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), studentId, courseId, teacher.id, milestone, completionPercent, notes || null)
    .run();

  return NextResponse.redirect(new URL("/dashboard?status=progress-saved", request.url));
}
