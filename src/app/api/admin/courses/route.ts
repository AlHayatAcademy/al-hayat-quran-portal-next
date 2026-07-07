import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { upsertCourse } from "@/lib/db/courses";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { courseCreateSchema, parseRequest } from "@/lib/utils/schemas";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireApiRole("admin");

    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await courseCreateSchema.safeParseAsync({
      title: formData.get("title"),
      level: formData.get("level"),
      description: formData.get("description"),
      status: formData.get("status") || "active",
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/admin?error=course", request.url));
    }

    const { title, level, description, status } = await parseRequest(parsed.data, courseCreateSchema);

    const courseId = `course_${slugify(title)}`;

    await upsertCourse({
      id: courseId,
      title,
      description: description || null,
      level: level || null,
      status: status === "inactive" ? "inactive" : "active",
    });
    await logAudit(admin.id, "update", "courses", courseId, { title, status });

    return NextResponse.redirect(new URL("/admin?status=course-saved", request.url));
  } catch (error) {
    return handleError(error);
  }
}
