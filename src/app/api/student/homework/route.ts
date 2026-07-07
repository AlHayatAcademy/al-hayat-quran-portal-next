import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { findStudentHomework, findStudentHomeworkList, updateHomeworkStatus } from "@/lib/db/homework";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { createApiResponse, handleError } from "@/lib/utils/error-handler";
import { parseRequest, studentHomeworkSchema } from "@/lib/utils/schemas";

/**
 * GET /api/student/homework
 * @returns {ApiResponse<{ homework: DbHomeworkItem[] }>}
 */
export async function GET() {
  try {
    const student = await requireApiRole("student");
    const homework = await findStudentHomeworkList(student.id);

    return createApiResponse({ homework });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await requireApiRole("student");
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await studentHomeworkSchema.safeParseAsync({
      homeworkId: formData.get("homeworkId"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
    }

    const { homeworkId } = await parseRequest(parsed.data, studentHomeworkSchema);

    const homework = await findStudentHomework(student.id, homeworkId);

    if (!homework || homework.status === "reviewed") {
      return NextResponse.redirect(new URL("/dashboard?error=homework", request.url));
    }

    await updateHomeworkStatus(homeworkId, "completed");
    await logAudit(student.id, "update", "homework_items", homeworkId, { status: "completed" });

    return NextResponse.redirect(new URL("/dashboard?status=homework-completed", request.url));
  } catch (error) {
    return handleError(error);
  }
}
