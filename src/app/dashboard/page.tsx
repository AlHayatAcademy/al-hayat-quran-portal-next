import Link from "next/link";
import {
  CalendarDays,
  ChartBar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/academy";

export const dynamic = "force-dynamic";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const user = await requireUser();
  const data = await getDashboardData(user);
  const params = await searchParams;
  const headline =
    user.role === "student"
      ? "Your Quran learning plan"
      : user.role === "parent"
        ? "Your child learning overview"
        : user.role === "teacher"
          ? "Teaching workspace"
          : "Academy overview";
  const intro =
    user.role === "student"
      ? "See your next classes, homework, attendance, and lesson progress in one calm place."
      : user.role === "parent"
        ? "Track your child classes, homework, attendance, progress, and teacher details from one screen."
        : user.role === "teacher"
          ? "Manage assigned students, class attendance, homework, and lesson progress."
          : "View your live academy activity from Cloudflare D1.";
  const metrics =
    user.role === "parent"
      ? [
          { title: "Children", value: String(data.childProfiles.length), icon: Users, tone: "bg-emerald-50 text-emerald-700" },
          { title: "Classes", value: String(data.classes.length), icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
          { title: "Homework", value: String(data.homework.length), icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
          { title: "Attendance", value: String(data.attendance.length), icon: CheckCircle2, tone: "bg-lime-50 text-lime-700" },
          { title: "Progress", value: String(data.progress.length), icon: TrendingUp, tone: "bg-cyan-50 text-cyan-700" },
          { title: "Payments", value: String(data.payments.length), icon: CreditCard, tone: "bg-rose-50 text-rose-700" },
        ]
      : [
          { title: "Role", value: user.role, icon: Users, tone: "bg-emerald-50 text-emerald-700" },
          { title: "Classes", value: String(data.classes.length), icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
          { title: "Homework", value: String(data.homework.length), icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
          { title: "Progress", value: String(data.progress.length), icon: ChartBar, tone: "bg-cyan-50 text-cyan-700" },
          { title: "Attendance", value: String(data.attendance.length), icon: CheckCircle2, tone: "bg-lime-50 text-lime-700" },
        ];

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">{user.role} dashboard</p>
          <h1 className="mt-3 text-4xl font-black">{headline}</h1>
          <p className="mt-3 max-w-3xl text-white/75">Welcome, {user.name}. {intro}</p>
          <form action="/api/auth/logout" method="post" className="mt-5">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-950">Logout</button>
          </form>
        </div>

        <h2 className="mt-8 text-2xl font-black text-emerald-950">Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
        </div>

        {params.status || params.error ? (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${
              params.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {params.error ? "Please check the form and try again." : "Saved successfully. Your dashboard is updated."}
          </div>
        ) : null}

        {user.role === "teacher" ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <SectionCard title="My Students">
              <div className="space-y-3">
                {data.teacherStudents.map((student) => (
                  <div key={student.student_id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{student.student_name}</p>
                    <p className="text-sm text-slate-600">
                      {student.course_title ?? "Course pending"} {student.parent_name ? `. Parent: ${student.parent_name}` : ""}
                    </p>
                    {student.learning_goal ? (
                      <p className="mt-2 text-xs font-semibold text-slate-500">{student.learning_goal}</p>
                    ) : null}
                  </div>
                ))}
                {!data.teacherStudents.length ? <p className="text-sm text-slate-500">No students assigned yet.</p> : null}
              </div>
            </SectionCard>

            <SectionCard title="Mark Attendance">
              <form action="/api/teacher/attendance" method="post" className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Class</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="classSessionId" required>
                    <option value="">Select class</option>
                    {data.classes.filter((item) => item.student_name).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.course_title} - {new Date(item.starts_at).toLocaleString()} - {item.student_name}
                      </option>
                    ))}
                  </select>
                </label>
                <select className="h-11 w-full rounded-2xl border border-slate-200 px-4" name="status">
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="excused">Excused</option>
                </select>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="notes"
                  placeholder="Class notes"
                />
                <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                  Save Attendance
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Assign Homework">
              <form action="/api/teacher/homework" method="post" className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Related class</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="classSessionId">
                    <option value="">No related class</option>
                    {data.classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.course_title} - {new Date(item.starts_at).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Student</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId" required>
                    <option value="">Select student</option>
                    {data.teacherStudents.map((student) => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.student_name}
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-slate-200 px-4"
                  name="title"
                  placeholder="Homework title"
                  required
                />
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="instructions"
                  placeholder="Practice instructions"
                />
                <input className="h-11 w-full rounded-2xl border border-slate-200 px-4" name="dueAt" type="datetime-local" />
                <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                  Assign Homework
                </button>
              </form>
            </SectionCard>
          </div>
        ) : null}

        {user.role === "teacher" ? (
          <div className="mt-8">
            <SectionCard title="Update Lesson Progress">
              <form action="/api/teacher/progress" method="post" className="grid gap-4 lg:grid-cols-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Student</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId" required>
                    <option value="">Select student</option>
                    {data.teacherStudents.map((student) => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.student_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Course</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="courseId" required>
                    <option value="">Select course</option>
                    {data.teacherStudents.filter((student) => student.course_id).map((student) => (
                      <option key={`${student.student_id}-${student.course_id}`} value={student.course_id ?? ""}>
                        {student.course_title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Milestone</span>
                  <input
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4"
                    name="milestone"
                    placeholder="Completed today"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Completion percent</span>
                  <input
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4"
                    name="completionPercent"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="0"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Notes</span>
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                    name="notes"
                    placeholder="Strengths and next target"
                  />
                </label>
                <div className="flex items-end">
                  <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                    Save Progress
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>
        ) : null}

        {user.role === "student" ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <SectionCard title="Next Classes">
              <div className="space-y-3">
                {data.classes.length ? data.classes.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{item.course_title}</p>
                    <p className="text-sm text-slate-600">{formatDateTime(item.starts_at)} . {item.teacher_name}</p>
                    {item.meeting_url ? (
                      <Link
                        href={item.meeting_url}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white"
                      >
                        <Video className="h-4 w-4" /> Join Class
                      </Link>
                    ) : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No classes assigned yet.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Homework">
              <div className="space-y-3">
                {data.homework.length ? data.homework.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{item.title}</p>
                    {item.instructions ? <p className="mt-2 text-sm text-slate-600">{item.instructions}</p> : null}
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                      {item.status}{item.due_at ? ` . Due ${formatDate(item.due_at)}` : ""}
                    </p>
                    {item.feedback ? (
                      <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">Teacher feedback: {item.feedback}</p>
                    ) : null}
                    {item.status !== "completed" && item.status !== "reviewed" ? (
                      <form action="/api/student/homework" method="post" className="mt-4">
                        <input type="hidden" name="homeworkId" value={item.id} />
                        <button className="h-10 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white">
                          Mark Complete
                        </button>
                      </form>
                    ) : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No homework assigned yet.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Progress Report">
              <div className="space-y-3">
                {data.progress.length ? data.progress.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{item.milestone}</p>
                        <p className="text-sm text-slate-600">{item.course_title}</p>
                      </div>
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                        {item.completion_percent}%
                      </span>
                    </div>
                    {item.notes ? <p className="mt-3 text-sm text-slate-600">{item.notes}</p> : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No lesson progress yet.</p>}
              </div>
            </SectionCard>
          </div>
        ) : null}

        {user.role === "parent" ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <SectionCard title="Child Profile">
              <div className="space-y-3">
                {data.childProfiles.length ? data.childProfiles.map((child) => (
                  <div key={child.student_id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-950">{child.student_name}</p>
                        <p className="text-sm text-slate-600">{child.course_title ?? "Course pending"}</p>
                      </div>
                    </div>
                    {child.learning_goal ? <p className="mt-3 text-sm text-slate-600">{child.learning_goal}</p> : null}
                    <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">
                      <p className="font-bold text-slate-950">{child.teacher_name ?? "Teacher pending"}</p>
                      <p>{child.teacher_email ?? "Teacher contact pending"}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No child profile found yet.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Upcoming Classes">
              <div className="space-y-3">
                {data.classes.length ? data.classes.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{item.course_title}</p>
                    <p className="text-sm text-slate-600">
                      {formatDateTime(item.starts_at)} . {item.student_name} . {item.teacher_name}
                    </p>
                    {item.meeting_url ? (
                      <Link
                        href={item.meeting_url}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white"
                      >
                        <Video className="h-4 w-4" /> Join Class
                      </Link>
                    ) : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No classes scheduled yet.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Homework Status">
              <div className="space-y-3">
                {data.homework.length ? data.homework.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{item.title}</p>
                    <p className="text-sm text-slate-600">
                      {item.student_name} . {item.teacher_name ?? "Teacher"}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                      {item.status}{item.due_at ? ` . Due ${formatDate(item.due_at)}` : ""}
                    </p>
                    {item.feedback ? (
                      <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">Teacher feedback: {item.feedback}</p>
                    ) : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No homework assigned yet.</p>}
              </div>
            </SectionCard>
          </div>
        ) : null}

        {user.role === "student" || user.role === "parent" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Attendance History">
              <div className="space-y-3">
                {data.attendance.length ? data.attendance.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{item.student_name}</p>
                        <p className="text-sm text-slate-600">
                          {item.starts_at ? formatDateTime(item.starts_at) : item.class_title}
                        </p>
                      </div>
                      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-bold uppercase text-lime-800">
                        {item.status}
                      </span>
                    </div>
                    {item.notes ? <p className="mt-3 text-sm text-slate-600">{item.notes}</p> : null}
                  </div>
                )) : <p className="text-sm text-slate-500">No attendance marked yet.</p>}
              </div>
            </SectionCard>

            <SectionCard title={user.role === "parent" ? "Lesson Progress" : "Announcements"}>
              {user.role === "parent" ? (
                <div className="space-y-3">
                  {data.progress.length ? data.progress.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-950">{item.milestone}</p>
                          <p className="text-sm text-slate-600">
                            {item.student_name} . {item.course_title} . {item.teacher_name ?? "Teacher"}
                          </p>
                        </div>
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                          {item.completion_percent}%
                        </span>
                      </div>
                      {item.notes ? <p className="mt-3 text-sm text-slate-600">{item.notes}</p> : null}
                    </div>
                  )) : <p className="text-sm text-slate-500">No lesson progress yet.</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.announcements.length ? data.announcements.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.body}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No announcements yet.</p>}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}

        {user.role !== "student" && user.role !== "parent" ? (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <SectionCard title="Classes">
                <div className="space-y-3">
                  {data.classes.length ? data.classes.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{item.course_title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateTime(item.starts_at)} . {item.teacher_name}
                        {item.student_name ? ` . ${item.student_name}` : ""}
                      </p>
                      {item.meeting_url ? (
                        <Link
                          href={item.meeting_url}
                          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white"
                        >
                          <Video className="h-4 w-4" /> Join Class
                        </Link>
                      ) : null}
                    </div>
                  )) : <p className="text-sm text-slate-500">No classes assigned yet.</p>}
                </div>
              </SectionCard>

              <SectionCard title="Announcements">
                <div className="space-y-3">
                  {data.announcements.length ? data.announcements.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.body}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No announcements yet.</p>}
                </div>
              </SectionCard>
            </div>

            <div className="mt-8">
              <SectionCard title="Homework and Lesson Progress">
                <div className="grid gap-3 md:grid-cols-3">
                  {data.homework.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.student_name} {item.due_at ? `. Due: ${formatDate(item.due_at)}` : ""}
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{item.status}</p>
                      {item.feedback ? (
                        <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">Feedback: {item.feedback}</p>
                      ) : null}
                      {user.role === "teacher" && item.status === "completed" ? (
                        <form action="/api/teacher/homework-review" method="post" className="mt-4 space-y-3">
                          <input type="hidden" name="homeworkId" value={item.id} />
                          <textarea
                            className="min-h-20 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:ring-4 focus:ring-emerald-900/10"
                            name="feedback"
                            placeholder="Feedback for student"
                          />
                          <button className="h-10 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white">
                            Review Homework
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ))}
                  {data.progress.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{item.milestone}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.course_title}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                        {item.completion_percent}% complete
                      </p>
                    </div>
                  ))}
                  {!data.homework.length && !data.progress.length ? (
                    <p className="text-sm text-slate-500">No homework or progress records yet.</p>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          </>
        ) : null}

        <div className="mt-8">
          <SectionCard title="Change Password">
            <form action="/api/account/password" method="post" className="grid gap-4 lg:grid-cols-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Current password</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="currentPassword"
                  type="password"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">New password</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Confirm password</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                />
              </label>
              <div className="flex items-end">
                <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                  Update Password
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
