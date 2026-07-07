import { getDb } from "@/lib/db";
import { AuthUser } from "@/lib/auth";

export type ClassRow = {
  id: string;
  starts_at: string;
  meeting_url: string | null;
  status: string;
  course_id?: string;
  teacher_id?: string;
  student_id?: string | null;
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
  feedback: string | null;
  teacher_name?: string;
  student_name: string;
};

export type ProgressRow = {
  id: string;
  milestone: string;
  completion_percent: number;
  notes: string | null;
  course_title: string;
  teacher_name?: string;
  student_name?: string;
};

export type AttendanceRow = {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  starts_at?: string;
  class_title: string;
  student_name: string;
  marked_by_name: string | null;
};

export type ChildProfileRow = {
  student_id: string;
  student_name: string;
  student_email: string;
  teacher_name: string | null;
  teacher_email: string | null;
  course_title: string | null;
  learning_goal: string | null;
};

export type TeacherStudentRow = {
  student_id: string;
  student_name: string;
  student_email: string;
  parent_name: string | null;
  course_id: string | null;
  course_title: string | null;
  learning_goal: string | null;
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
              homework_items.due_at, homework_items.status, homework_items.feedback,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM homework_items
       INNER JOIN users AS teacher ON teacher.id = homework_items.teacher_id
       INNER JOIN users AS student ON student.id = homework_items.student_id
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
              lesson_progress.notes, courses.title AS course_title,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM lesson_progress
       INNER JOIN courses ON courses.id = lesson_progress.course_id
       INNER JOIN users AS teacher ON teacher.id = lesson_progress.teacher_id
       INNER JOIN users AS student ON student.id = lesson_progress.student_id
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

  const teacherStudents =
    user.role === "teacher"
      ? await db
          .prepare(
            `SELECT student.id AS student_id, student.name AS student_name, student.email AS student_email,
                    parent.name AS parent_name,
                    courses.id AS course_id, courses.title AS course_title,
                    student_profiles.learning_goal
             FROM student_profiles
             INNER JOIN users AS student ON student.id = student_profiles.user_id
             LEFT JOIN users AS parent ON parent.id = student_profiles.parent_id
             LEFT JOIN courses ON courses.id = student_profiles.course_id
             WHERE student_profiles.teacher_id = ?
             ORDER BY student.name ASC`,
          )
          .bind(user.id)
          .all<TeacherStudentRow>()
      : { results: [] as TeacherStudentRow[] };

  const attendanceQuery =
    user.role === "student"
      ? "WHERE attendance_records.student_id = ?"
      : user.role === "teacher"
        ? "WHERE class_sessions.teacher_id = ?"
        : user.role === "parent"
          ? "WHERE student_profiles.parent_id = ?"
          : "";

  const attendance = attendanceQuery
    ? await db
        .prepare(
          `SELECT attendance_records.id, attendance_records.status, attendance_records.notes,
                  attendance_records.created_at, class_sessions.starts_at,
                  courses.title || ' - ' || class_sessions.starts_at AS class_title,
                  student.name AS student_name,
                  marker.name AS marked_by_name
           FROM attendance_records
           INNER JOIN class_sessions ON class_sessions.id = attendance_records.class_session_id
           INNER JOIN courses ON courses.id = class_sessions.course_id
           INNER JOIN users AS student ON student.id = attendance_records.student_id
           LEFT JOIN users AS marker ON marker.id = attendance_records.marked_by
           LEFT JOIN student_profiles ON student_profiles.user_id = attendance_records.student_id
           ${attendanceQuery}
           ORDER BY attendance_records.created_at DESC
           LIMIT 8`,
        )
        .bind(user.id)
        .all<AttendanceRow>()
    : { results: [] as AttendanceRow[] };

  const childProfiles =
    user.role === "parent"
      ? await db
          .prepare(
            `SELECT student.id AS student_id, student.name AS student_name, student.email AS student_email,
                    teacher.name AS teacher_name, teacher.email AS teacher_email,
                    courses.title AS course_title,
                    student_profiles.learning_goal
             FROM student_profiles
             INNER JOIN users AS student ON student.id = student_profiles.user_id
             LEFT JOIN users AS teacher ON teacher.id = student_profiles.teacher_id
             LEFT JOIN courses ON courses.id = student_profiles.course_id
             WHERE student_profiles.parent_id = ?
             ORDER BY student.name ASC`,
          )
          .bind(user.id)
          .all<ChildProfileRow>()
      : { results: [] as ChildProfileRow[] };

  return {
    classes: classes.results ?? [],
    homework: homework.results ?? [],
    progress: progress.results ?? [],
    payments: payments.results ?? [],
    announcements: announcements.results ?? [],
    teacherStudents: teacherStudents.results ?? [],
    attendance: attendance.results ?? [],
    childProfiles: childProfiles.results ?? [],
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
        (SELECT COUNT(*) FROM attendance_records) AS attendance,
        (SELECT COUNT(*) FROM lesson_progress) AS progress,
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
      `SELECT id, name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 8`,
    )
    .all<{ id: string; name: string; email: string; role: string; status: string; created_at: string }>();

  const resetUsers = await db
    .prepare(
      `SELECT id, name, email, role, status
       FROM users
       WHERE status = 'active'
       ORDER BY role ASC, name ASC`,
    )
    .all<{ id: string; name: string; email: string; role: string; status: string }>();

  const families = await db
    .prepare(
      `SELECT student.id AS student_id, student.name AS student_name,
              parent.id AS parent_id, parent.name AS parent_name, parent.email AS parent_email,
              teacher.id AS teacher_id, teacher.name AS teacher_name,
              courses.id AS course_id, courses.title AS course_title,
              student_profiles.learning_goal, student_profiles.created_at
       FROM student_profiles
       INNER JOIN users AS student ON student.id = student_profiles.user_id
       LEFT JOIN users AS parent ON parent.id = student_profiles.parent_id
       LEFT JOIN users AS teacher ON teacher.id = student_profiles.teacher_id
       LEFT JOIN courses ON courses.id = student_profiles.course_id
       ORDER BY student_profiles.created_at DESC
       LIMIT 8`,
    )
    .all<{
      student_id: string;
      student_name: string;
      parent_id: string | null;
      parent_name: string | null;
      parent_email: string | null;
      teacher_id: string | null;
      teacher_name: string | null;
      course_id: string | null;
      course_title: string | null;
      learning_goal: string | null;
      created_at: string;
    }>();

  const teachers = await db
    .prepare(
      `SELECT id, name, email, status
       FROM users
       WHERE role = 'teacher'
       ORDER BY name ASC`,
    )
    .all<{ id: string; name: string; email: string; status: string }>();

  const students = await db
    .prepare(
      `SELECT users.id, users.name, users.email, users.status,
              parent.name AS parent_name,
              teacher.name AS teacher_name,
              courses.title AS course_title
       FROM users
       LEFT JOIN student_profiles ON student_profiles.user_id = users.id
       LEFT JOIN users AS parent ON parent.id = student_profiles.parent_id
       LEFT JOIN users AS teacher ON teacher.id = student_profiles.teacher_id
       LEFT JOIN courses ON courses.id = student_profiles.course_id
       WHERE users.role = 'student'
       ORDER BY users.name ASC`,
    )
    .all<{
      id: string;
      name: string;
      email: string;
      status: string;
      parent_name: string | null;
      teacher_name: string | null;
      course_title: string | null;
    }>();

  const courses = await db
    .prepare(
      `SELECT id, title, description, level, status, created_at
       FROM courses
       ORDER BY title ASC`,
    )
    .all<{
      id: string;
      title: string;
      description: string | null;
      level: string | null;
      status: string;
      created_at: string;
    }>();

  const classSessions = await db
    .prepare(
      `SELECT class_sessions.id, class_sessions.course_id, class_sessions.teacher_id, class_sessions.student_id,
              class_sessions.starts_at, class_sessions.meeting_url, class_sessions.status,
              courses.title AS course_title,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM class_sessions
       INNER JOIN courses ON courses.id = class_sessions.course_id
       INNER JOIN users AS teacher ON teacher.id = class_sessions.teacher_id
       LEFT JOIN users AS student ON student.id = class_sessions.student_id
       ORDER BY class_sessions.starts_at DESC
       LIMIT 10`,
    )
    .all<ClassRow>();

  const attendance = await db
    .prepare(
      `SELECT attendance_records.id, attendance_records.status, attendance_records.notes,
              attendance_records.created_at,
              courses.title || ' - ' || class_sessions.starts_at AS class_title,
              student.name AS student_name,
              marker.name AS marked_by_name
       FROM attendance_records
       INNER JOIN class_sessions ON class_sessions.id = attendance_records.class_session_id
       INNER JOIN courses ON courses.id = class_sessions.course_id
       INNER JOIN users AS student ON student.id = attendance_records.student_id
       LEFT JOIN users AS marker ON marker.id = attendance_records.marked_by
       ORDER BY attendance_records.created_at DESC
       LIMIT 8`,
    )
    .all<AttendanceRow>();

  const homework = await db
    .prepare(
      `SELECT homework_items.id, homework_items.title, homework_items.instructions,
              homework_items.due_at, homework_items.status, homework_items.feedback,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM homework_items
       INNER JOIN users AS teacher ON teacher.id = homework_items.teacher_id
       INNER JOIN users AS student ON student.id = homework_items.student_id
       ORDER BY homework_items.created_at DESC
       LIMIT 8`,
    )
    .all<HomeworkRow>();

  const progress = await db
    .prepare(
      `SELECT lesson_progress.id, lesson_progress.milestone, lesson_progress.completion_percent,
              lesson_progress.notes,
              courses.title AS course_title,
              teacher.name AS teacher_name,
              student.name AS student_name
       FROM lesson_progress
       INNER JOIN courses ON courses.id = lesson_progress.course_id
       INNER JOIN users AS teacher ON teacher.id = lesson_progress.teacher_id
       INNER JOIN users AS student ON student.id = lesson_progress.student_id
       ORDER BY lesson_progress.created_at DESC
       LIMIT 8`,
    )
    .all<ProgressRow>();

  return {
    counts: counts ?? {},
    applications: applications.results ?? [],
    users: users.results ?? [],
    resetUsers: resetUsers.results ?? [],
    families: families.results ?? [],
    teachers: teachers.results ?? [],
    students: students.results ?? [],
    courses: courses.results ?? [],
    classSessions: classSessions.results ?? [],
    attendance: attendance.results ?? [],
    homework: homework.results ?? [],
    progress: progress.results ?? [],
  };
}
