import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request: NextRequest) {
  await requireRole("admin");

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active");

  if (!title) {
    return NextResponse.redirect(new URL("/admin?error=course", request.url));
  }

  const db = await getDb();
  const courseId = `course_${slugify(title)}`;

  await db
    .prepare(
      `INSERT INTO courses (id, title, description, level, status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         level = excluded.level,
         status = excluded.status`,
    )
    .bind(courseId, title, description, level, status === "inactive" ? "inactive" : "active")
    .run();

  return NextResponse.redirect(new URL("/admin?status=course-saved", request.url));
}
