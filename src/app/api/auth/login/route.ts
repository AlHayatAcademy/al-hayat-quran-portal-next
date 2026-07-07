import { NextRequest, NextResponse } from "next/server";
import { createSession, dashboardPathForRole, verifyPassword, UserRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { ApiError, handleError } from "@/lib/utils/error-handler";
import { checkLoginRateLimit, clearLoginRateLimit } from "@/lib/utils/rate-limit";
import { loginSchema, parseRequest } from "@/lib/utils/schemas";

type LoginUser = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: string;
  email_verified_at: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    await requireCsrfToken(formData);
    const parsed = await loginSchema.safeParseAsync({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return NextResponse.redirect(new URL("/login?error=missing", request.url));
    }

    const { email, password } = await parseRequest(parsed.data, loginSchema);

    if (!(await checkLoginRateLimit(email))) {
      throw new ApiError("Too many login attempts. Try again in 1 minute.", 429, "RATE_LIMIT");
    }

    const db = await getDb();
    const user = await db
      .prepare(
        `SELECT id, email, password_hash, role, status, email_verified_at
         FROM users
         WHERE lower(email) = ?
           AND deleted_at IS NULL
         LIMIT 1`,
      )
      .bind(email)
      .first<LoginUser>();

    if (!user || user.status !== "active" || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url));
    }

    if (!user.email_verified_at) {
      return NextResponse.redirect(new URL("/login?error=email-unverified", request.url));
    }

    await clearLoginRateLimit(email);
    const session = await createSession(user.id);
    await logAudit(user.id, "login", "sessions");
    const response = NextResponse.redirect(new URL(dashboardPathForRole(user.role), request.url));

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
