import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { AuthError, UnauthorizedError } from "@/lib/utils/error-handler";

export type UserRole = "admin" | "teacher" | "student" | "parent";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  locale: string;
};

const sessionCookie = "alhayat_session";
const sessionDays = 7;

function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(first: string, second: string) {
  if (first.length !== second.length) return false;

  let result = 0;
  for (let index = 0; index < first.length; index += 1) {
    result |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return result === 0;
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(digest);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return `pbkdf2$${iterations}$${bytesToHex(salt)}$${bytesToHex(derivedBits)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsValue, saltHex, hashHex] = storedHash.split("$");

  if (scheme !== "pbkdf2" || !iterationsValue || !saltHex || !hashHex) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations: Number(iterationsValue),
      hash: "SHA-256",
    },
    key,
    256,
  );

  return timingSafeEqual(bytesToHex(derivedBits), hashHex);
}

export async function createSession(userId: string) {
  const db = await getDb();
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToHex(tokenBytes);
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, tokenHash, expiresAt)
    .run();

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;

  if (token) {
    const db = await getDb();
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
  }

  cookieStore.delete(sessionCookie);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;

  if (!token) {
    return null;
  }

  const db = await getDb();
  const user = await db
    .prepare(
      `SELECT users.id, users.name, users.email, users.role, users.status, users.locale
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?
         AND sessions.expires_at > ?
         AND users.status = 'active'
         AND users.deleted_at IS NULL
       LIMIT 1`,
    )
    .bind(await hashToken(token), new Date().toISOString())
    .first<AuthUser>();

  return user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireApiRole(role: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError();
  }

  if (user.role !== role) {
    throw new UnauthorizedError();
  }

  return user;
}

export function dashboardPathForRole(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}
