import { NextRequest, NextResponse } from "next/server";
import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/utils/audit";
import { handleError } from "@/lib/utils/error-handler";

type VerificationToken = {
  id: string;
  user_id: string;
};

/**
 * GET /api/auth/verify-email
 * @returns {ApiResponse<never>} Redirects to login with verification status.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=verification", request.url));
    }

    const db = await getDb();
    const verification = await db
      .prepare(
        `SELECT email_verification_tokens.id, email_verification_tokens.user_id
         FROM email_verification_tokens
         INNER JOIN users ON users.id = email_verification_tokens.user_id
         WHERE email_verification_tokens.token_hash = ?
           AND email_verification_tokens.used_at IS NULL
           AND email_verification_tokens.expires_at > ?
           AND users.status = 'active'
           AND users.deleted_at IS NULL
         LIMIT 1`,
      )
      .bind(await hashToken(token), new Date().toISOString())
      .first<VerificationToken>();

    if (!verification) {
      return NextResponse.redirect(new URL("/login?error=verification", request.url));
    }

    const now = new Date().toISOString();
    await db.batch([
      db.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(now, now, verification.user_id),
      db.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE id = ?").bind(now, verification.id),
    ]);
    await logAudit(verification.user_id, "update", "users", verification.user_id, { field: "email_verified_at" });

    return NextResponse.redirect(new URL("/login?status=email-verified", request.url));
  } catch (error) {
    return handleError(error);
  }
}
