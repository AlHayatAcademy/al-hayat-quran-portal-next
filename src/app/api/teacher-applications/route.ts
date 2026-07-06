import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);
  const bio = String(formData.get("bio") ?? "").trim();

  if (!name || !email || !specialty || !bio) {
    return NextResponse.redirect(new URL("/apply?error=missing", request.url));
  }

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO teacher_applications
        (id, name, email, phone, specialty, experience_years, bio, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(crypto.randomUUID(), name, email, phone, specialty, Number.isFinite(experienceYears) ? experienceYears : 0, bio)
    .run();

  return NextResponse.redirect(new URL("/apply?status=submitted", request.url));
}
