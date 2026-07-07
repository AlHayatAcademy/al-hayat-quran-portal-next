ALTER TABLE users ADD COLUMN deleted_at TEXT;
ALTER TABLE users ADD COLUMN updated_at TEXT;

ALTER TABLE courses ADD COLUMN deleted_at TEXT;
ALTER TABLE courses ADD COLUMN updated_at TEXT;

ALTER TABLE teacher_applications ADD COLUMN deleted_at TEXT;
ALTER TABLE teacher_applications ADD COLUMN updated_at TEXT;

ALTER TABLE student_profiles ADD COLUMN deleted_at TEXT;
ALTER TABLE student_profiles ADD COLUMN updated_at TEXT;

ALTER TABLE class_sessions ADD COLUMN deleted_at TEXT;
ALTER TABLE class_sessions ADD COLUMN updated_at TEXT;

ALTER TABLE attendance_records ADD COLUMN deleted_at TEXT;
ALTER TABLE attendance_records ADD COLUMN updated_at TEXT;

ALTER TABLE homework_items ADD COLUMN deleted_at TEXT;
ALTER TABLE homework_items ADD COLUMN updated_at TEXT;

ALTER TABLE lesson_progress ADD COLUMN deleted_at TEXT;
ALTER TABLE lesson_progress ADD COLUMN updated_at TEXT;

ALTER TABLE payments ADD COLUMN deleted_at TEXT;
ALTER TABLE payments ADD COLUMN updated_at TEXT;

ALTER TABLE support_tickets ADD COLUMN deleted_at TEXT;
ALTER TABLE support_tickets ADD COLUMN updated_at TEXT;

ALTER TABLE announcements ADD COLUMN deleted_at TEXT;
ALTER TABLE announcements ADD COLUMN updated_at TEXT;

UPDATE users SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE courses SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE teacher_applications SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE student_profiles SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE class_sessions SET updated_at = COALESCE(updated_at, starts_at, CURRENT_TIMESTAMP);
UPDATE attendance_records SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE homework_items SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE lesson_progress SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE payments SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE support_tickets SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);
UPDATE announcements SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  user_id TEXT NOT NULL REFERENCES users(id),
  resource_type TEXT,
  resource_id TEXT,
  changes TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
