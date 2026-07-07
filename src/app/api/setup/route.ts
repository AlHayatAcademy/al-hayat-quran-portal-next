import { NextRequest, NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { getCloudflareEnv, getDb } from "@/lib/db";
import { assertEnv } from "@/lib/env";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";
import { parseRequest, setupSchema } from "@/lib/utils/schemas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await setupSchema.safeParseAsync({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      setupToken: formData.get("setupToken"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/setup?error=missing", request.url));
    }

    const { name, email, password, setupToken } = await parseRequest(parsed.data, setupSchema);

    const env = await getCloudflareEnv();
    assertEnv(env, { requireSetupToken: true });

    if (setupToken !== env.SETUP_TOKEN) {
      return NextResponse.redirect(new URL("/setup?error=token", request.url));
    }

    const db = await getDb();
    const existingAdmin = await db
      .prepare("SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1")
      .first<{ id: string }>();

    if (existingAdmin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, status, locale, email_verified_at)
         VALUES (?, ?, ?, ?, 'admin', 'active', 'en', ?)`,
      )
      .bind(userId, name, email, await hashPassword(password), new Date().toISOString())
      .run();

    const session = await createSession(userId);
    await logAudit(userId, "create", "users", userId, { role: "admin" });
    await logAudit(userId, "login", "sessions");
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set("alhayat_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      expires: new Date(session.expiresAt),
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
