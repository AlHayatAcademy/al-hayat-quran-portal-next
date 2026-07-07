import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { findTeacherHomework, updateHomeworkStatus } from "@/lib/db/homework";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { homeworkReviewSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireApiRole("teacher");
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await homeworkReviewSchema.safeParseAsync({
      homeworkId: formData.get("homeworkId"),
      feedback: formData.get("feedback"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/dashboard?error=homework-review", request.url));
    }

    const { homeworkId, feedback } = await parseRequest(parsed.data, homeworkReviewSchema);

    const homework = await findTeacherHomework(teacher.id, homeworkId);

    if (!homework) {
      return NextResponse.redirect(new URL("/dashboard?error=homework-review", request.url));
    }

    await updateHomeworkStatus(homeworkId, "reviewed", feedback || null);
    await logAudit(teacher.id, "update", "homework_items", homeworkId, { status: "reviewed" });

    return NextResponse.redirect(new URL("/dashboard?status=homework-reviewed", request.url));
  } catch (error) {
    return handleError(error);
  }
}
