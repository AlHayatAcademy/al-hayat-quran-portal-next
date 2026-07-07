import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { homeworkCreateSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await homeworkCreateSchema.safeParseAsync({
      classSessionId: formData.get("classSessionId"),
      teacherId: formData.get("teacherId"),
      studentId: formData.get("studentId"),
      title: formData.get("title"),
      instructions: formData.get("instructions"),
      dueAt: formData.get("dueAt"),
      status: formData.get("status") || "assigned",
    });

    if (!parsed.success || !parsed.data.teacherId) {
      return NextResponse.redirect(new URL("/admin?error=homework", request.url));
    }

    const { classSessionId, teacherId, studentId, title, instructions, dueAt, status } = await parseRequest(
      parsed.data,
      homeworkCreateSchema,
    );

    const dueAtIso = dueAt ? new Date(dueAt).toISOString() : null;
    const db = await getDb();

    const homeworkId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO homework_items
          (id, class_session_id, teacher_id, student_id, title, instructions, due_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        homeworkId,
        classSessionId || null,
        teacherId,
        studentId,
        title,
        instructions || null,
        dueAtIso,
        status || "assigned",
      )
      .run();
    await logAudit(admin.id, "create", "homework_items", homeworkId, { studentId, teacherId, title });

    return NextResponse.redirect(new URL("/admin?status=homework-assigned", request.url));
  } catch (error) {
    return handleError(error);
  }
}
