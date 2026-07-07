import { getDb } from "@/lib/db";

export type DbLessonProgress = {
  id: string;
  student_id: string;
  course_id: string;
  teacher_id: string;
  milestone: string;
  completion_percent: number;
  notes: string | null;
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export async function findProgressByStudent(studentId: string): Promise<DbLessonProgress[]> {
  const db = await getDb();
  const result = await db
    .prepare("SELECT * FROM lesson_progress WHERE student_id = ? AND deleted_at IS NULL ORDER BY created_at DESC")
    .bind(studentId)
    .all<DbLessonProgress>();
  return result.results ?? [];
}

export async function softDeleteProgress(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE lesson_progress SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
