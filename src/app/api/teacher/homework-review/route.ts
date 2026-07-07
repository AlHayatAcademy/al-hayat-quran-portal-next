import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const teacher = await requireRole("teacher");
  const formData = await request.formData();
  const homeworkId = String(formData.get("homeworkId") ?? "").trim();
  const feedback = String(formData.get("feedback") ?? "").trim();

  if (!homeworkId) {
    return NextResponse.redirect(new URL("/dashboard?error=homework-review", request.url));
  }

  const db = await getDb();
  const homework = await db
    .prepare("SELECT id FROM homework_items WHERE id = ? AND teacher_id = ? LIMIT 1")
    .bind(homeworkId, teacher.id)
    .first<{ id: string }>();

  if (!homework) {
    return NextResponse.redirect(new URL("/dashboard?error=homework-review", request.url));
  }

  await db
    .prepare("UPDATE homework_items SET status = 'reviewed', feedback = ? WHERE id = ? AND teacher_id = ?")
    .bind(feedback || null, homeworkId, teacher.id)
    .run();

  return NextResponse.redirect(new URL("/dashboard?status=homework-reviewed", request.url));
}
