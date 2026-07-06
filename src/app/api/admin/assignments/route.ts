import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");

  const formData = await request.formData();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();

  if (!studentId || !teacherId || !courseId) {
    return NextResponse.redirect(new URL("/admin?error=assignment", request.url));
  }

  const db = await getDb();
  const profile = await db
    .prepare("SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1")
    .bind(studentId)
    .first<{ id: string }>();

  if (profile) {
    await db
      .prepare("UPDATE student_profiles SET teacher_id = ?, course_id = ? WHERE user_id = ?")
      .bind(teacherId, courseId, studentId)
      .run();
  } else {
    await db
      .prepare("INSERT INTO student_profiles (id, user_id, teacher_id, course_id) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), studentId, teacherId, courseId)
      .run();
  }

  return NextResponse.redirect(new URL("/admin?status=assigned", request.url));
}
