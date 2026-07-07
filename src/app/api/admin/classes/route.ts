import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { classCreateSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await classCreateSchema.safeParseAsync({
      courseId: formData.get("courseId"),
      teacherId: formData.get("teacherId"),
      studentId: formData.get("studentId"),
      startsAt: formData.get("startsAt"),
      meetingUrl: formData.get("meetingUrl"),
      status: formData.get("status") || "scheduled",
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=class", request.url));
    }

    const { courseId, teacherId, studentId, startsAt, meetingUrl, status } = await parseRequest(
      parsed.data,
      classCreateSchema,
    );
    const startsAtIso = new Date(startsAt).toISOString();
    const db = await getDb();

    const classSessionId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO class_sessions
          (id, course_id, teacher_id, student_id, starts_at, meeting_provider, meeting_url, status)
         VALUES (?, ?, ?, ?, ?, 'manual', ?, ?)`,
      )
      .bind(
        classSessionId,
        courseId,
        teacherId,
        studentId || null,
        startsAtIso,
        meetingUrl || null,
        status || "scheduled",
      )
      .run();
    await logAudit(admin.id, "create", "class_sessions", classSessionId, { courseId, teacherId, studentId });

    return NextResponse.redirect(new URL("/admin?status=class-created", request.url));
  } catch (error) {
    return handleError(error);
  }
}
