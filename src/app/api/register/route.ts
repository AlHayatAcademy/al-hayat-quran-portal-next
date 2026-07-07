import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentEmail = String(formData.get("parentEmail") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const studentName = String(formData.get("studentName") ?? "").trim();
  const studentAge = String(formData.get("studentAge") ?? "").trim();
  const courseTitle = String(formData.get("courseTitle") ?? "").trim();
  const learningGoal = String(formData.get("learningGoal") ?? "").trim();

  if (!parentName || !parentEmail || !password || !studentName || !courseTitle || password.length < 10) {
    return NextResponse.redirect(new URL("/register?error=missing", request.url));
  }

  const db = await getDb();
  const existing = await db.prepare("SELECT id FROM users WHERE lower(email) = ? LIMIT 1").bind(parentEmail).first();

  if (existing) {
    return NextResponse.redirect(new URL("/register?error=exists", request.url));
  }

  const parentId = crypto.randomUUID();
  const studentId = crypto.randomUUID();
  const courseId = `course_${slugify(courseTitle)}`;
  const studentEmail = `${studentId}@student.alhayat.local`;
  const parentPasswordHash = await hashPassword(password);
  const studentPasswordHash = await hashPassword(crypto.randomUUID());
  const learningGoalNotes = [learningGoal, phone ? `Phone: ${phone}` : "", studentAge ? `Age: ${studentAge}` : ""]
    .filter(Boolean)
    .join("\n");

  await db.batch([
    db
      .prepare("INSERT OR IGNORE INTO courses (id, title, description, level, status) VALUES (?, ?, ?, ?, 'active')")
      .bind(courseId, courseTitle, `${courseTitle} enrollment course.`, "Enrollment"),
    db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, status, locale)
         VALUES (?, ?, ?, ?, 'parent', 'active', 'en')`,
      )
      .bind(parentId, parentName, parentEmail, parentPasswordHash),
    db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, status, locale)
         VALUES (?, ?, ?, ?, 'student', 'active', 'en')`,
      )
      .bind(studentId, studentName, studentEmail, studentPasswordHash),
    db
      .prepare(
        `INSERT INTO student_profiles (id, user_id, parent_id, course_id, learning_goal)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), studentId, parentId, courseId, learningGoalNotes),
  ]);

  return NextResponse.redirect(new URL("/register?status=registered", request.url));
}
