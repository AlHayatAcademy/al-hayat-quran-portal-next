import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { findHomeworkById, updateHomeworkStatus } from "@/lib/db/homework";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { homeworkReviewSchema, parseRequest } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await homeworkReviewSchema.safeParseAsync({
      homeworkId: formData.get("homeworkId"),
      feedback: formData.get("feedback"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=homework-review", request.url));
    }

    const { homeworkId, feedback } = await parseRequest(parsed.data, homeworkReviewSchema);

    const homework = await findHomeworkById(homeworkId);

    if (!homework) {
      return NextResponse.redirect(new URL("/admin?error=homework-review", request.url));
    }

    await updateHomeworkStatus(homeworkId, "reviewed", feedback || null);
    await logAudit(admin.id, "update", "homework_items", homeworkId, { status: "reviewed" });

    return NextResponse.redirect(new URL("/admin?status=homework-reviewed", request.url));
  } catch (error) {
    return handleError(error);
  }
}
