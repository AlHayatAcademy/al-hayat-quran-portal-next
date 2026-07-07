import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const student = await requireRole("student");
  const formData = await request.formData();
  const homeworkId = String(formData.get("homeworkId") ?? "").trim();

  if (!homeworkId) {
    return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
  }

  const db = await getDb();
  const homework = await db
    .prepare("SELECT id, status FROM homework_items WHERE id = ? AND student_id = ? LIMIT 1")
    .bind(homeworkId, student.id)
    .first<{ id: string; status: string }>();

  if (!homework || homework.status === "reviewed") {
    return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
  }

  await db
    .prepare("UPDATE homework_items SET status = 'completed' WHERE id = ? AND student_id = ?")
    .bind(homeworkId, student.id)
    .run();

  return NextResponse.redirect(new URL("/dashboard?status=homework-completed", request.url));
}
