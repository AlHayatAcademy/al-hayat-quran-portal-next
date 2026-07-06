import { getDb } from "@/lib/db";
import { AuthUser } from "@/lib/auth";

export type ClassRow = {
  id: string;
  starts_at: string;
  meeting_url: string | null;
  status: string;
  course_title: string;
  teacher_name: string;
  student_name: string | null;
};

export type HomeworkRow = {
  id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  status: string;
  student_name: string;
};

export type ProgressRow = {
  id: string;
  milestone: string;
  completion_percent: number;
  notes: string | null;
  course_title: string;
};

export type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
};

export async function getDashboardData(user: AuthUser) {
  const db = await getDb();

  const classesQuery =
    user.role === "teacher"
      ? `WHERE class_sessions.teacher_id = ?`
      : user.role === "student"
        ? `WHERE class_sessions.student_id = ?`
        : user.role === "parent"
          ? `WHERE student_profiles.parent_id = ?`
          : "";

  const classes = await db
    .prepare(
      `SELECT class_sessions.id, class_sessions.starts_at, class_sessions.meeting_url, class_sessions.status,
              courses.title AS course_title,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM class_sessions
       INNER JOIN courses ON courses.id = class_sessions.course_id
       INNER JOIN users AS teacher ON teacher.id = class_sessions.teacher_id
       LEFT JOIN users AS student ON student.id = class_sessions.student_id
       LEFT JOIN student_profiles ON student_profiles.user_id = class_sessions.student_id
       ${classesQuery}
       ORDER BY class_sessions.starts_at ASC
       LIMIT 6`,
    )
    .bind(...(classesQuery ? [user.id] : []))
    .all<ClassRow>();

  const homeworkQuery =
    user.role === "teacher"
      ? "WHERE homework_items.teacher_id = ?"
      : user.role === "student"
        ? "WHERE homework_items.student_id = ?"
        : user.role === "parent"
          ? "WHERE student_profiles.parent_id = ?"
          : "";

  const homework = await db
    .prepare(
      `SELECT homework_items.id, homework_items.title, homework_items.instructions,
              homework_items.due_at, homework_items.status, users.name AS student_name
       FROM homework_items
       INNER JOIN users ON users.id = homework_items.student_id
       LEFT JOIN student_profiles ON student_profiles.user_id = homework_items.student_id
       ${homeworkQuery}
       ORDER BY homework_items.due_at ASC
       LIMIT 6`,
    )
    .bind(...(homeworkQuery ? [user.id] : []))
    .all<HomeworkRow>();

  const progressQuery =
    user.role === "student"
      ? "WHERE lesson_progress.student_id = ?"
      : user.role === "teacher"
        ? "WHERE lesson_progress.teacher_id = ?"
        : user.role === "parent"
          ? "WHERE student_profiles.parent_id = ?"
          : "";

  const progress = await db
    .prepare(
      `SELECT lesson_progress.id, lesson_progress.milestone, lesson_progress.completion_percent,
              lesson_progress.notes, courses.title AS course_title
       FROM lesson_progress
       INNER JOIN courses ON courses.id = lesson_progress.course_id
       LEFT JOIN student_profiles ON student_profiles.user_id = lesson_progress.student_id
       ${progressQuery}
       ORDER BY lesson_progress.created_at DESC
       LIMIT 6`,
    )
    .bind(...(progressQuery ? [user.id] : []))
    .all<ProgressRow>();

  const payments =
    user.role === "parent" || user.role === "student"
      ? await db
          .prepare(
            `SELECT payments.id, payments.amount_cents, payments.currency, payments.status, payments.paid_at, payments.notes
             FROM payments
             WHERE payments.parent_id = ? OR payments.student_id = ?
             ORDER BY payments.created_at DESC
             LIMIT 6`,
          )
          .bind(user.id, user.id)
          .all<PaymentRow>()
      : { results: [] as PaymentRow[] };

  const announcements = await db
    .prepare(
      `SELECT title, body, audience, published_at
       FROM announcements
       WHERE audience = 'all' OR audience = ?
       ORDER BY published_at DESC
       LIMIT 3`,
    )
    .bind(user.role)
    .all<{ title: string; body: string; audience: string; published_at: string | null }>();

  return {
    classes: classes.results ?? [],
    homework: homework.results ?? [],
    progress: progress.results ?? [],
    payments: payments.results ?? [],
    announcements: announcements.results ?? [],
  };
}

export async function getAdminData() {
  const db = await getDb();

  const counts = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teachers,
        (SELECT COUNT(*) FROM courses) AS courses,
        (SELECT COUNT(*) FROM class_sessions) AS classes,
        (SELECT COUNT(*) FROM homework_items) AS homework,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') AS tickets,
        (SELECT COUNT(*) FROM teacher_applications WHERE status = 'pending') AS applications`,
    )
    .first<Record<string, number>>();

  const applications = await db
    .prepare(
      `SELECT name, email, specialty, experience_years, status, created_at
       FROM teacher_applications
       ORDER BY created_at DESC
       LIMIT 6`,
    )
    .all<{ name: string; email: string; specialty: string | null; experience_years: number | null; status: string }>();

  const users = await db
    .prepare(
      `SELECT name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 8`,
    )
    .all<{ name: string; email: string; role: string; status: string; created_at: string }>();

  return {
    counts: counts ?? {},
    applications: applications.results ?? [],
    users: users.results ?? [],
  };
}
