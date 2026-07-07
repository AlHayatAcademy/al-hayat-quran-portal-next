/**
 * @jest-environment node
 */

import { POST } from "@/app/api/auth/login/route";
import { createSession, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { checkLoginRateLimit, clearLoginRateLimit } from "@/lib/utils/rate-limit";

jest.mock("@/lib/auth", () => ({
  createSession: jest.fn(),
  dashboardPathForRole: jest.fn((role: string) => (role === "admin" ? "/admin" : "/dashboard")),
  verifyPassword: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

jest.mock("@/lib/utils/audit", () => ({
  logAudit: jest.fn(),
}));

jest.mock("@/lib/utils/csrf", () => ({
  requireCsrfToken: jest.fn(),
}));

jest.mock("@/lib/utils/rate-limit", () => ({
  checkLoginRateLimit: jest.fn(),
  clearLoginRateLimit: jest.fn(),
}));

function createLoginRequest(fields: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return new Request("https://learn-quran.example/api/auth/login", {
    method: "POST",
    body: formData,
  });
}

function mockUserLookup(user: unknown) {
  const first = jest.fn().mockResolvedValue(user);
  const bind = jest.fn(() => ({ first }));
  const prepare = jest.fn(() => ({ bind }));

  jest.mocked(getDb).mockResolvedValue({ prepare } as never);

  return { bind, first, prepare };
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(checkLoginRateLimit).mockResolvedValue(true);
    jest.mocked(clearLoginRateLimit).mockResolvedValue(undefined);
    jest.mocked(createSession).mockResolvedValue({
      token: "session-token",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
  });

  it("redirects active users and sets a session cookie for valid credentials", async () => {
    mockUserLookup({
      id: "user_1",
      email: "student@example.com",
      password_hash: "hashed-password",
      role: "student",
      status: "active",
      email_verified_at: "2026-07-07T00:00:00.000Z",
    });
    jest.mocked(verifyPassword).mockResolvedValue(true);

    const response = await POST(
      createLoginRequest({
        csrf: "csrf-token",
        email: "student@example.com",
        password: "TestPassword123!",
      }) as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://learn-quran.example/dashboard");
    expect(response.headers.get("set-cookie")).toContain("alhayat_session=session-token");
  });

  it("redirects with an invalid error when credentials do not match", async () => {
    mockUserLookup({
      id: "user_1",
      email: "student@example.com",
      password_hash: "hashed-password",
      role: "student",
      status: "active",
      email_verified_at: "2026-07-07T00:00:00.000Z",
    });
    jest.mocked(verifyPassword).mockResolvedValue(false);

    const response = await POST(
      createLoginRequest({
        csrf: "csrf-token",
        email: "student@example.com",
        password: "WrongPassword123!",
      }) as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://learn-quran.example/login?error=invalid");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("redirects with an email-unverified error when the account email is not verified", async () => {
    mockUserLookup({
      id: "user_1",
      email: "student@example.com",
      password_hash: "hashed-password",
      role: "student",
      status: "active",
      email_verified_at: null,
    });
    jest.mocked(verifyPassword).mockResolvedValue(true);

    const response = await POST(
      createLoginRequest({
        csrf: "csrf-token",
        email: "student@example.com",
        password: "TestPassword123!",
      }) as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://learn-quran.example/login?error=email-unverified");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns 429 when login attempts are rate limited", async () => {
    jest.mocked(checkLoginRateLimit).mockResolvedValue(false);

    const response = await POST(
      createLoginRequest({
        csrf: "csrf-token",
        email: "student@example.com",
        password: "TestPassword123!",
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error.code).toBe("RATE_LIMIT");
    expect(getDb).not.toHaveBeenCalled();
  });

  it("redirects with a missing error when submitted fields are invalid", async () => {
    const response = await POST(
      createLoginRequest({
        csrf: "csrf-token",
        email: "not-an-email",
        password: "",
      }) as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://learn-quran.example/login?error=missing");
    expect(getDb).not.toHaveBeenCalled();
  });
});
