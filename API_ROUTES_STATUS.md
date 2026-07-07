# API Routes Status

Status reflects the current implementation after Phase 6. Existing `POST` routes that back plain HTML forms intentionally keep redirect responses; new read-only endpoints return JSON via `createApiResponse({ ... })`.

## Auth and Account Routes

- Complete: `POST /api/auth/login` signs active users in with validation, CSRF, audit logging, and a session cookie.
- Complete: `POST /api/auth/logout` clears the current session with CSRF and audit logging.
- Complete: `POST /api/auth/password-reset` accepts a reset request and sends a generic success response.
- Complete: `POST /api/auth/reset-password/verify` validates a reset token and updates the password.
- Complete: `GET /api/auth/verify-email` verifies one-time email verification tokens.
- Complete: `POST /api/account/password` changes the authenticated user's password.

## Public Setup and Intake Routes

- Complete: `POST /api/setup` bootstraps the first admin behind `SETUP_TOKEN`.
- Complete: `POST /api/register` creates a user from an invitation.
- Complete: `POST /api/invite` accepts invitation-backed registration details.
- Complete: `POST /api/teacher-applications` submits a teacher application.
- Incomplete: Public `GET` status endpoints are not implemented because the current UI only needs form submission flows.

## Admin Routes

- Complete: `POST /api/admin/courses` creates or updates a course.
- Complete: `POST /api/admin/classes` creates a class session.
- Complete: `POST /api/admin/homework` creates homework as an admin.
- Complete: `POST /api/admin/homework-review` reviews submitted homework.
- Complete: `POST /api/admin/progress` records lesson progress.
- Complete: `POST /api/admin/attendance` records attendance.
- Complete: `POST /api/admin/assignments` updates student teacher/course assignment details.
- Complete: `POST /api/admin/invitations` creates invitations.
- Complete: `POST /api/admin/password-reset` resets a user's password administratively.
- Complete: `POST /api/admin/teacher-applications` approves or rejects applications.
- Incomplete: Admin JSON `GET` list endpoints are not implemented; the admin dashboard currently reads through server-side academy data helpers.
- Incomplete: Admin `PUT`, `PATCH`, and `DELETE` routes are not implemented as broad CRUD APIs. Existing destructive behavior uses soft-delete-aware helpers where already wired, but the UI does not yet expose general RESTful management.

## Teacher Routes

- Complete: `GET /api/teacher/classes` lists the teacher's active class sessions with course and student details.
- Complete: `GET /api/teacher/students` lists students assigned to the teacher with parent and course context.
- Complete: `GET /api/teacher/attendance` lists attendance records for the teacher's classes.
- Complete: `POST /api/teacher/attendance` creates or updates attendance from the dashboard form and preserves redirect behavior.
- Complete: `GET /api/teacher/homework` lists active homework assigned by the teacher to owned students.
- Complete: `POST /api/teacher/homework` creates homework from the dashboard form and preserves redirect behavior.
- Complete: `POST /api/teacher/homework-review` reviews completed homework.
- Complete: `GET /api/teacher/progress` lists lesson progress for the teacher's assigned students.
- Complete: `POST /api/teacher/progress` records lesson progress from the dashboard form and preserves redirect behavior.
- Incomplete: Teacher `PUT` and `DELETE` endpoints are not implemented. Phase 6 avoided broad mutation routes until the UI and data model define edit/delete flows clearly.

## Student Routes

- Complete: `GET /api/student/classes` lists the authenticated student's active class sessions.
- Complete: `GET /api/student/homework` lists the authenticated student's active homework.
- Complete: `POST /api/student/homework` lets the authenticated student mark owned homework complete and preserves redirect behavior.
- Complete: `GET /api/student/progress` lists the authenticated student's lesson progress.
- Incomplete: Student mutation routes beyond homework completion are intentionally not implemented; students should not create, delete, or broadly edit academic records.

## Parent Routes

- Incomplete: No `/api/parent/*` JSON routes exist yet. Parent dashboard data is still served through server-side helpers with ownership filtering.

## Priorities

1. Highest: keep auth, registration, password reset, attendance, homework, and progress stable because these support active user workflows.
2. Next: add admin JSON `GET` routes if an API client or richer admin UI needs them.
3. Later: add targeted `PUT`/`DELETE` routes only when paired with clear UI, validation schemas, audit events, and ownership rules.
