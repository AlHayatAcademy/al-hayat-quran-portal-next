import { cookies, headers } from "next/headers";
import { ApiError } from "@/lib/utils/error-handler";

const csrfCookieName = "alhayat_csrf";
const csrfHeaderName = "x-alhayat-csrf";

export async function getCsrfToken(): Promise<string> {
  const requestHeaders = await headers();
  const headerToken = requestHeaders.get(csrfHeaderName);

  if (headerToken) {
    return headerToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get(csrfCookieName)?.value ?? "";
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(csrfCookieName)?.value;
  return Boolean(token && storedToken && token === storedToken);
}

export async function requireCsrfToken(formData: FormData): Promise<void> {
  const csrf = String(formData.get("csrf") ?? "");

  if (!(await verifyCsrfToken(csrf))) {
    throw new ApiError("Invalid CSRF token.", 403, "CSRF_INVALID");
  }
}
