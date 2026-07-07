import { NextRequest, NextResponse } from "next/server";

const csrfCookieName = "alhayat_csrf";
const csrfHeaderName = "x-alhayat-csrf";

function createToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const existingCsrf = request.cookies.get(csrfCookieName)?.value;
  const csrfToken = existingCsrf ?? createToken();
  requestHeaders.set(csrfHeaderName, csrfToken);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (!existingCsrf) {
    response.cookies.set(csrfCookieName, csrfToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
