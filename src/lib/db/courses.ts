import { getDb } from "@/lib/db";

export type DbCourse = {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  status: string;
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export async function findCourseById(id: string): Promise<DbCourse | null> {
  const db = await getDb();
  const course = await db.prepare("SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(id).first<DbCourse>();
  return course ?? null;
}

export async function findActiveCourses(): Promise<DbCourse[]> {
  const db = await getDb();
  const result = await db
    .prepare("SELECT * FROM courses WHERE status = 'active' AND deleted_at IS NULL ORDER BY title ASC")
    .all<DbCourse>();
  return result.results ?? [];
}

export async function upsertCourse(course: Pick<DbCourse, "id" | "title" | "description" | "level" | "status">): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO courses (id, title, description, level, status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         level = excluded.level,
         status = excluded.status,
         deleted_at = NULL,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(course.id, course.title, course.description, course.level, course.status)
    .run();
}

export async function softDeleteCourse(id: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE courses SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .bind(new Date().toISOString(), new Date().toISOString(), id)
    .run();
}
