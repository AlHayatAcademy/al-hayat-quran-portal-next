import { getDb } from "@/lib/db";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/error-handler";

type MaybeDeletedRecord = {
  deleted_at?: string | null;
};

export async function requireOwnership(userId: string, resourceOwnerId: string | null | undefined): Promise<void> {
  if (!resourceOwnerId || userId !== resourceOwnerId) {
    throw new UnauthorizedError("You do not own this resource.");
  }
}

export async function requireTeacherOwnsStudent(teacherId: string, studentId: string): Promise<void> {
  const db = await getDb();
  const ownership = await db
    .prepare(
      `SELECT id
       FROM student_profiles
       WHERE user_id = ?
         AND teacher_id = ?
         AND deleted_at IS NULL
       LIMIT 1`,
    )
    .bind(studentId, teacherId)
    .first<{ id: string }>();

  if (!ownership) {
    throw new UnauthorizedError("This student is not assigned to you.");
  }
}

export async function requireParentOwnsChild(parentId: string, studentId: string): Promise<void> {
  const db = await getDb();
  const ownership = await db
    .prepare(
      `SELECT id
       FROM student_profiles
       WHERE user_id = ?
         AND parent_id = ?
         AND deleted_at IS NULL
       LIMIT 1`,
    )
    .bind(studentId, parentId)
    .first<{ id: string }>();

  if (!ownership) {
    throw new UnauthorizedError("This student is not assigned to you.");
  }
}

export function requireNotDeleted<T extends MaybeDeletedRecord | null | undefined>(record: T): NonNullable<T> {
  if (!record || record.deleted_at) {
    throw new NotFoundError();
  }

  return record;
}
