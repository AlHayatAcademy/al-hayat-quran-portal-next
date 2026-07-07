import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await requireRole("admin");
  const formData = await request.formData();
  const homeworkId = String(formData.get("homeworkId") ?? "").trim();
  const feedback = String(formData.get("feedback") ?? "").trim();

  if (!homeworkId) {
    return NextResponse.redirect(new URL("/admin?error=homework-review", request.url));
  }

  const db = await getDb();
  const homework = await db
    .prepare("SELECT id FROM homework_items WHERE id = ? LIMIT 1")
    .bind(homeworkId)
    .first<{ id: string }>();

  if (!homework) {
    return NextResponse.redirect(new URL("/admin?error=homework-review", request.url));
  }

  await db
    .prepare("UPDATE homework_items SET status = 'reviewed', feedback = ? WHERE id = ?")
    .bind(feedback || null, homeworkId)
    .run();

  return NextResponse.redirect(new URL("/admin?status=homework-reviewed", request.url));
}
