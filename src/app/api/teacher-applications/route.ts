import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, teacherApplicationSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await teacherApplicationSchema.safeParseAsync({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialty: formData.get("specialty"),
      experienceYears: formData.get("experienceYears"),
      bio: formData.get("bio"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/apply?error=missing", request.url));
    }

    const { name, email, phone, specialty, experienceYears, bio } = await parseRequest(
      parsed.data,
      teacherApplicationSchema,
    );

    const db = await getDb();
    const applicationId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO teacher_applications
          (id, name, email, phone, specialty, experience_years, bio, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      )
      .bind(applicationId, name, email, phone, specialty, experienceYears, bio)
      .run();

    return NextResponse.redirect(new URL("/apply?status=submitted", request.url));
  } catch (error) {
    return handleError(error);
  }
}
