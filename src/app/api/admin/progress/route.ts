import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");

  const formData = await request.formData();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const milestone = String(formData.get("milestone") ?? "").trim();
  const completionPercentValue = Number(formData.get("completionPercent") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!studentId || !courseId || !teacherId || !milestone || Number.isNaN(completionPercentValue)) {
    return NextResponse.redirect(new URL("/admin?error=progress", request.url));
  }

  const completionPercent = Math.min(100, Math.max(0, Math.round(completionPercentValue)));
  const db = await getDb();

  await db
    .prepare(
      `INSERT INTO lesson_progress
        (id, student_id, course_id, teacher_id, milestone, completion_percent, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), studentId, courseId, teacherId, milestone, completionPercent, notes || null)
    .run();

  return NextResponse.redirect(new URL("/admin?status=progress-saved", request.url));
}
