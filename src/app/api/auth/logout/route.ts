import { NextRequest, NextResponse } from "next/server";
import { clearSession, getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/utils/audit";
import { requireCsrfToken } from "@/lib/utils/csrf";
import { handleError } from "@/lib/utils/error-handler";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();
    await requireCsrfToken(formData);
    await clearSession();
    if (user) {
      await logAudit(user.id, "logout", "sessions");
    }
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    return handleError(error);
  }
}
