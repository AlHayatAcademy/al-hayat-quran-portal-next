import { getDb } from "@/lib/db";

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "teacher" | "student" | "parent";
  status: string;
  locale: string;
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export async function findUserById(id: string): Promise<DbUser | null> {
  const db = await getDb();
  const user = await db.prepare("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(id).first<DbUser>();
  return user ?? null;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const db = await getDb();
  const user = await db
    .prepare("SELECT * FROM users WHERE lower(email) = ? AND deleted_at IS NULL LIMIT 1")
    .bind(email.trim().toLowerCase())
    .first<DbUser>();
  return user ?? null;
}

export async function findActiveUsers(role?: DbUser["role"]): Promise<DbUser[]> {
  const db = await getDb();
  const query = role
    ? "SELECT * FROM users WHERE role = ? AND status = 'active' AND deleted_at IS NULL ORDER BY name ASC"
    : "SELECT * FROM users WHERE status = 'active' AND deleted_at IS NULL ORDER BY role ASC, name ASC";
  const result = role ? await db.prepare(query).bind(role).all<DbUser>() : await db.prepare(query).all<DbUser>();
  return result.results ?? [];
}

export async function updateUserPasswordHash(id: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(passwordHash, new Date().toISOString(), id)
    .run();
}

export async function softDeleteUser(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
