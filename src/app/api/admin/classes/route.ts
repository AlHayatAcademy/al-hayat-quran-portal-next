import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");

  const formData = await request.formData();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();
  const status = String(formData.get("status") ?? "scheduled").trim();

  if (!courseId || !teacherId || !startsAt) {
    return NextResponse.redirect(new URL("/admin?error=class", request.url));
  }

  const startsAtIso = new Date(startsAt).toISOString();
  const db = await getDb();

  await db
    .prepare(
      `INSERT INTO class_sessions
        (id, course_id, teacher_id, student_id, starts_at, meeting_provider, meeting_url, status)
       VALUES (?, ?, ?, ?, ?, 'manual', ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      courseId,
      teacherId,
      studentId || null,
      startsAtIso,
      meetingUrl || null,
      status || "scheduled",
    )
    .run();

  return NextResponse.redirect(new URL("/admin?status=class-created", request.url));
}
