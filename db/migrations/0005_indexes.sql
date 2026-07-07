CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_role_deleted_at ON users(role, deleted_at);

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);

CREATE INDEX IF NOT EXISTS idx_teacher_applications_email ON teacher_applications(email);
CREATE INDEX IF NOT EXISTS idx_teacher_applications_status ON teacher_applications(status);
CREATE INDEX IF NOT EXISTS idx_teacher_applications_deleted_at ON teacher_applications(deleted_at);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_teacher_id ON student_profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent_id ON student_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_course_id ON student_profiles(course_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_deleted_at ON student_profiles(deleted_at);

CREATE INDEX IF NOT EXISTS idx_class_sessions_course_id ON class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_student_id ON class_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status ON class_sessions(status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_starts_at ON class_sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_deleted_at ON class_sessions(deleted_at);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_class_session_id ON attendance_records(class_session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_marked_by ON attendance_records(marked_by);
CREATE INDEX IF NOT EXISTS idx_attendance_records_deleted_at ON attendance_records(deleted_at);

CREATE INDEX IF NOT EXISTS idx_homework_items_student_id ON homework_items(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_items_teacher_id ON homework_items(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_items_class_session_id ON homework_items(class_session_id);
CREATE INDEX IF NOT EXISTS idx_homework_items_status ON homework_items(status);
CREATE INDEX IF NOT EXISTS idx_homework_items_due_at ON homework_items(due_at);
CREATE INDEX IF NOT EXISTS idx_homework_items_deleted_at ON homework_items(deleted_at);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_id ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_teacher_id ON lesson_progress(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_deleted_at ON lesson_progress(deleted_at);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_parent_id ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON payments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_support_tickets_opened_by ON support_tickets(opened_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_deleted_at ON support_tickets(deleted_at);

CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(audience);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_deleted_at ON announcements(deleted_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_invitation_tokens_user_id ON invitation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_purpose ON invitation_tokens(purpose);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_expires_at ON invitation_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
