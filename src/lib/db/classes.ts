import { getDb } from "@/lib/db";

export type DbClassSession = {
  id: string;
  course_id: string;
  teacher_id: string;
  student_id: string | null;
  starts_at: string;
  meeting_provider: string;
  meeting_url: string | null;
  status: string;
  deleted_at: string | null;
  updated_at: string | null;
};

export async function findClassSessionById(id: string): Promise<DbClassSession | null> {
  const db = await getDb();
  const session = await db
    .prepare("SELECT * FROM class_sessions WHERE id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(id)
    .first<DbClassSession>();
  return session ?? null;
}

export async function findTeacherClassSession(teacherId: string, classSessionId: string): Promise<DbClassSession | null> {
  const db = await getDb();
  const session = await db
    .prepare("SELECT * FROM class_sessions WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(classSessionId, teacherId)
    .first<DbClassSession>();
  return session ?? null;
}

export async function markClassSessionCompleted(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE class_sessions SET status = 'completed', updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), id)
    .run();
}

export async function softDeleteClassSession(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE class_sessions SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
