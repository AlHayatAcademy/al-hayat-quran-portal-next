import { getDb } from "@/lib/db";

export type DbHomeworkItem = {
  id: string;
  class_session_id: string | null;
  teacher_id: string;
  student_id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  status: string;
  feedback: string | null;
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export async function findHomeworkById(id: string): Promise<DbHomeworkItem | null> {
  const db = await getDb();
  const homework = await db
    .prepare("SELECT * FROM homework_items WHERE id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(id)
    .first<DbHomeworkItem>();
  return homework ?? null;
}

export async function findStudentHomework(studentId: string, homeworkId: string): Promise<DbHomeworkItem | null> {
  const db = await getDb();
  const homework = await db
    .prepare("SELECT * FROM homework_items WHERE id = ? AND student_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(homeworkId, studentId)
    .first<DbHomeworkItem>();
  return homework ?? null;
}

export async function findStudentHomeworkList(studentId: string): Promise<DbHomeworkItem[]> {
  const db = await getDb();
  const result = await db
    .prepare(
      `SELECT h.*
       FROM homework_items h
       WHERE h.student_id = ?
         AND h.deleted_at IS NULL
       ORDER BY COALESCE(h.due_at, h.created_at) DESC`,
    )
    .bind(studentId)
    .all<DbHomeworkItem>();
  return result.results ?? [];
}

export async function findTeacherHomework(teacherId: string, homeworkId: string): Promise<DbHomeworkItem | null> {
  const db = await getDb();
  const homework = await db
    .prepare("SELECT * FROM homework_items WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(homeworkId, teacherId)
    .first<DbHomeworkItem>();
  return homework ?? null;
}

export async function updateHomeworkStatus(id: string, status: string, feedback?: string | null): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE homework_items SET status = ?, feedback = COALESCE(?, feedback), updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(status, feedback ?? null, new Date().toISOString(), id)
    .run();
}

export async function softDeleteHomework(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE homework_items SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
