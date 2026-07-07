import { z } from "zod";

const optionalText = (max = 1000) => z.string().trim().max(max).optional().or(z.literal(""));
const requiredId = z.string().trim().min(1, "Required");
const dateTime = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date");
const optionalDateTime = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Invalid date");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
export const strongPasswordSchema = z.string().min(10, "Password must be at least 10 characters");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().trim().min(1, "Token is required"),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
});

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminPasswordResetSchema = z
  .object({
    userId: requiredId,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const setupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: strongPasswordSchema,
  setupToken: z.string().trim().min(1, "Setup token is required"),
});

export const registerSchema = z.object({
  parentName: z.string().trim().min(2, "Parent name is required").max(100),
  parentEmail: z.string().trim().toLowerCase().email("Invalid email format"),
  phone: optionalText(40),
  password: strongPasswordSchema,
  studentName: z.string().trim().min(2, "Student name is required").max(100),
  studentAge: optionalText(20),
  courseTitle: z.string().trim().min(3, "Course title is required").max(100),
  learningGoal: optionalText(1000),
});

export const courseCreateSchema = z.object({
  title: z.string().trim().min(3, "Course title must be at least 3 characters").max(100),
  description: optionalText(1000),
  level: optionalText(80),
  status: z.enum(["active", "inactive"]).catch("active"),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const userInviteSchema = z.object({
  userId: requiredId,
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  locale: z.string().trim().min(2).max(10).optional(),
  role: z.enum(["admin", "teacher", "student", "parent"]).optional(),
});

export const classCreateSchema = z.object({
  courseId: requiredId,
  teacherId: requiredId,
  studentId: z.string().trim().optional().or(z.literal("")),
  startsAt: dateTime,
  meetingUrl: z.string().trim().url("Invalid meeting URL").optional().or(z.literal("")),
  status: z.string().trim().max(40).optional().or(z.literal("")),
});

export const assignmentSchema = z.object({
  studentId: requiredId,
  teacherId: requiredId,
  courseId: requiredId,
});

export const attendanceSchema = z.object({
  classSessionId: requiredId,
  studentId: requiredId,
  status: z.enum(["present", "absent", "late", "excused"]).catch("present"),
  notes: optionalText(1000),
});

export const teacherAttendanceSchema = z.object({
  classSessionId: requiredId,
  status: z.enum(["present", "absent", "late", "excused"]).catch("present"),
  notes: optionalText(1000),
});

export const homeworkCreateSchema = z.object({
  classSessionId: z.string().trim().optional().or(z.literal("")),
  teacherId: z.string().trim().optional().or(z.literal("")),
  studentId: requiredId,
  title: z.string().trim().min(3, "Homework title must be at least 3 characters").max(160),
  instructions: optionalText(2000),
  dueAt: optionalDateTime,
  status: z.string().trim().max(40).optional().or(z.literal("")),
});

export const homeworkReviewSchema = z.object({
  homeworkId: requiredId,
  feedback: optionalText(2000),
});

export const progressUpdateSchema = z.object({
  studentId: requiredId,
  courseId: requiredId,
  teacherId: z.string().trim().optional().or(z.literal("")),
  milestone: z.string().trim().min(3, "Milestone is required").max(160),
  completionPercent: z.coerce.number().min(0).max(100).catch(0),
  notes: optionalText(2000),
});

export const studentHomeworkSchema = z.object({
  homeworkId: requiredId,
});

export const teacherApplicationSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  phone: optionalText(40),
  specialty: z.string().trim().min(2, "Specialty is required").max(120),
  experienceYears: z.coerce.number().min(0).max(80).catch(0),
  bio: z.string().trim().min(10, "Bio is required").max(3000),
});

export const teacherApplicationActionSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  action: z.enum(["approve", "reject"]),
});

export async function parseRequest<T>(data: unknown, schema: z.ZodSchema<T>): Promise<T> {
  return schema.parseAsync(data);
}

export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type UserInviteInput = z.infer<typeof userInviteSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ClassCreateInput = z.infer<typeof classCreateSchema>;
export type HomeworkCreateInput = z.infer<typeof homeworkCreateSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
