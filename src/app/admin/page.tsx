import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Headphones,
  Link2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/academy";

export const dynamic = "force-dynamic";

function StatusBadge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "emerald" | "amber" | "red" | "sky" | "slate" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-700",
    sky: "bg-sky-100 text-sky-800",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-800",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function inviteBadge(status: string) {
  if (status === "used") return <StatusBadge tone="emerald">Password created</StatusBadge>;
  if (status === "sent") return <StatusBadge tone="sky">Setup sent</StatusBadge>;
  if (status === "expired") return <StatusBadge tone="red">Expired</StatusBadge>;
  return <StatusBadge tone="amber">Setup needed</StatusBadge>;
}

function inviteActionLabel(status: string) {
  if (status === "sent") return "Resend setup link";
  if (status === "expired") return "Send new setup link";
  if (status === "used") return "Send setup link";
  return "Send setup link";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string; invite?: string; email?: string; emailStatus?: string }>;
}) {
  const user = await requireRole("admin");
  const data = await getAdminData();
  const params = await searchParams;
  const onboardingStats = {
    stuck:
      data.onboarding.teachers.filter((item) => item.invitation_status === "none" || item.invitation_status === "expired")
        .length +
      data.onboarding.parents.filter((item) => item.invitation_status === "none" || item.invitation_status === "expired")
        .length +
      data.onboarding.students.filter(
        (item) =>
          item.invitation_status === "none" ||
          item.invitation_status === "expired" ||
          !item.teacher_id ||
          !item.course_id ||
          item.scheduled_classes === 0,
      ).length,
    setupSent:
      data.onboarding.teachers.filter((item) => item.invitation_status === "sent").length +
      data.onboarding.parents.filter((item) => item.invitation_status === "sent").length +
      data.onboarding.students.filter((item) => item.invitation_status === "sent").length,
    loginReady:
      data.onboarding.teachers.filter((item) => item.invitation_status === "used" || item.active_sessions > 0).length +
      data.onboarding.parents.filter((item) => item.invitation_status === "used" || item.active_sessions > 0).length +
      data.onboarding.students.filter((item) => item.invitation_status === "used" || item.active_sessions > 0).length,
  };
  const metrics = [
    { title: "Students", value: String(data.counts.students ?? 0), icon: Users, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Teachers", value: String(data.counts.teachers ?? 0), icon: GraduationCap, tone: "bg-amber-50 text-amber-700" },
    { title: "Courses", value: String(data.counts.courses ?? 0), icon: BookOpen, tone: "bg-sky-50 text-sky-700" },
    { title: "Classes", value: String(data.counts.classes ?? 0), icon: CalendarDays, tone: "bg-violet-50 text-violet-700" },
    { title: "Homework", value: String(data.counts.homework ?? 0), icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
    { title: "Attendance", value: String(data.counts.attendance ?? 0), icon: CheckCircle2, tone: "bg-lime-50 text-lime-700" },
    { title: "Progress", value: String(data.counts.progress ?? 0), icon: TrendingUp, tone: "bg-cyan-50 text-cyan-700" },
    { title: "Support", value: String(data.counts.tickets ?? 0), icon: Headphones, tone: "bg-indigo-50 text-indigo-700" },
    { title: "Approvals", value: String(data.counts.applications ?? 0), icon: ShieldCheck, tone: "bg-green-50 text-green-700" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Admin</p>
          <h1 className="text-4xl font-black tracking-tight text-emerald-950">Academy control center</h1>
          <p className="max-w-3xl text-slate-600">
            Signed in as {user.name}. Manage teachers, students, parents, courses, classes, attendance, lesson
            progress, homework, payments, support tickets, announcements, and teacher approvals.
          </p>
          <form action="/api/auth/logout" method="post">
            <button className="mt-3 rounded-full border border-emerald-900/20 bg-white px-4 py-2 text-sm font-bold text-emerald-950">
              Logout
            </button>
          </form>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((module) => (
            <MetricCard key={module.title} {...module} />
          ))}
        </div>
        {params.status || params.error ? (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${
              params.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {params.error
              ? "Please check the form and try again."
              : "Saved successfully. The admin data is now updated."}
          </div>
        ) : null}

        {params.invite ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            <p>Password setup link created{params.email ? ` for ${params.email}` : ""}.</p>
            <p className="mt-1">
              {params.emailStatus === "sent"
                ? "Email sent automatically."
                : "Email is not configured yet, so copy this link and send it manually."}
            </p>
            <p className="mt-2 break-all rounded-xl bg-white p-3 font-mono text-xs text-slate-700">
              https://learn-quran.drimranhayat.com/invite?token={params.invite}
            </p>
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Onboarding Center</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-emerald-950">Account setup command center</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                See exactly who can log in, who has a setup link pending, and which students still need assignment,
                class placement, or account setup.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Needs action</p>
                <p className="mt-1 text-2xl font-black text-amber-950">{onboardingStats.stuck}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Setup sent</p>
                <p className="mt-1 text-2xl font-black text-sky-950">{onboardingStats.setupSent}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Login ready</p>
                <p className="mt-1 text-2xl font-black text-emerald-950">{onboardingStats.loginReady}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-950">Teacher Applications</h3>
                <StatusBadge tone="amber">
                  {data.onboarding.applications.filter((item) => item.status === "pending").length} pending
                </StatusBadge>
              </div>
              <div className="mt-4 space-y-3">
                {data.onboarding.applications.map((application) => (
                  <div key={application.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{application.name}</p>
                        <p className="text-sm text-slate-600">
                          {application.specialty ?? "Specialty pending"} . {application.experience_years ?? 0} years
                        </p>
                        <p className="text-xs text-slate-500">{application.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge
                          tone={
                            application.status === "approved"
                              ? "emerald"
                              : application.status === "rejected"
                                ? "red"
                                : "amber"
                          }
                        >
                          {application.status === "approved"
                            ? "Approved"
                            : application.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </StatusBadge>
                        {application.teacher_user_id ? inviteBadge(application.invitation_status) : null}
                      </div>
                    </div>
                    {application.status === "pending" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <form action="/api/admin/teacher-applications" method="post">
                          <input type="hidden" name="email" value={application.email} />
                          <input type="hidden" name="action" value="approve" />
                          <button className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-bold text-white">
                            Approve + send setup
                          </button>
                        </form>
                        <form action="/api/admin/teacher-applications" method="post">
                          <input type="hidden" name="email" value={application.email} />
                          <input type="hidden" name="action" value="reject" />
                          <button className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700">
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                ))}
                {!data.onboarding.applications.length ? (
                  <p className="text-sm text-slate-500">No teacher applications yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-950">Teachers</h3>
              <div className="mt-4 space-y-3">
                {data.onboarding.teachers.map((teacher) => (
                  <div key={teacher.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{teacher.name}</p>
                        <p className="text-sm text-slate-600">{teacher.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {inviteBadge(teacher.invitation_status)}
                        {teacher.active_sessions > 0 ? <StatusBadge tone="emerald">Active session</StatusBadge> : null}
                      </div>
                    </div>
                    <form action="/api/admin/invitations" method="post" className="mt-4 flex flex-wrap gap-2">
                      <input type="hidden" name="userId" value={teacher.id} />
                      <button className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-emerald-950">
                        <Mail className="h-4 w-4" />
                        {inviteActionLabel(teacher.invitation_status)}
                      </button>
                    </form>
                  </div>
                ))}
                {!data.onboarding.teachers.length ? <p className="text-sm text-slate-500">No teachers yet.</p> : null}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-950">Students</h3>
              <div className="mt-4 space-y-3">
                {data.onboarding.students.map((student) => (
                  <div key={student.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{student.name}</p>
                        <p className="text-sm text-slate-600">{student.email}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Parent: {student.parent_name ?? "Unassigned"} . Teacher: {student.teacher_name ?? "Unassigned"}
                        </p>
                        <p className="text-sm text-slate-600">Course: {student.course_title ?? "Course needed"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {inviteBadge(student.invitation_status)}
                        {student.teacher_id && student.course_id ? (
                          <StatusBadge tone="emerald">Assigned</StatusBadge>
                        ) : (
                          <StatusBadge tone="amber">Needs assignment</StatusBadge>
                        )}
                        {student.scheduled_classes > 0 ? (
                          <StatusBadge tone="emerald">
                            {student.scheduled_classes} class{student.latest_class_status ? ` . ${student.latest_class_status}` : ""}
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="violet">Needs class</StatusBadge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                      <form action="/api/admin/invitations" method="post">
                        <input type="hidden" name="userId" value={student.id} />
                        <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-emerald-950 lg:w-auto">
                          <Mail className="h-4 w-4" />
                          {inviteActionLabel(student.invitation_status)}
                        </button>
                      </form>
                      {student.teacher_id && student.course_id ? null : (
                        <a
                          href="#assign-student"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900/20 bg-white px-4 py-2 text-xs font-bold text-emerald-950"
                        >
                          <Link2 className="h-4 w-4" />
                          Assign
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {!data.onboarding.students.length ? <p className="text-sm text-slate-500">No students yet.</p> : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-950">Parents</h3>
              <div className="mt-4 space-y-3">
                {data.onboarding.parents.map((parent) => (
                  <div key={parent.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{parent.name}</p>
                        <p className="text-sm text-slate-600">{parent.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {inviteBadge(parent.invitation_status)}
                        {parent.active_sessions > 0 ? <StatusBadge tone="emerald">Active session</StatusBadge> : null}
                      </div>
                    </div>
                    <form action="/api/admin/invitations" method="post" className="mt-4 flex flex-wrap gap-2">
                      <input type="hidden" name="userId" value={parent.id} />
                      <button className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-emerald-950">
                        <Mail className="h-4 w-4" />
                        {inviteActionLabel(parent.invitation_status)}
                      </button>
                    </form>
                  </div>
                ))}
                {!data.onboarding.parents.length ? <p className="text-sm text-slate-500">No parents yet.</p> : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <SectionCard title="Add / Update Course">
            <form action="/api/admin/courses" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Course title</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="title"
                  placeholder="Tajweed"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Level</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="level"
                  placeholder="Beginner / Intermediate / Advanced"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Description</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="description"
                />
              </label>
              <select className="h-11 w-full rounded-2xl border border-slate-200 px-4" name="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                Save Course
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Assign Student">
            <form id="assign-student" action="/api/admin/assignments" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Student</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId" required>
                  <option value="">Select student</option>
                  {data.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.parent_name ? `(${student.parent_name})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Teacher</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="teacherId" required>
                  <option value="">Select teacher</option>
                  {data.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Course</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="courseId" required>
                  <option value="">Select course</option>
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                Save Assignment
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Schedule Class">
            <form action="/api/admin/classes" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Course</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="courseId" required>
                  <option value="">Select course</option>
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Teacher</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="teacherId" required>
                  <option value="">Select teacher</option>
                  {data.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Student</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId">
                  <option value="">Group class / no student</option>
                  {data.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Start time</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4"
                  name="startsAt"
                  type="datetime-local"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Meeting link</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4"
                  name="meetingUrl"
                  placeholder="https://meet.google.com/..."
                  type="url"
                />
              </label>
              <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                Create Class
              </button>
            </form>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <SectionCard title="Mark Attendance">
            <form action="/api/admin/attendance" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Class</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="classSessionId" required>
                  <option value="">Select class</option>
                  {data.classSessions.map((item) => (
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
                  {data.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
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
                placeholder="Recitation, punctuality, or class notes"
              />
              <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                Save Attendance
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Assign Homework">
            <form action="/api/admin/homework" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Related class</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="classSessionId">
                  <option value="">No related class</option>
                  {data.classSessions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.course_title} - {new Date(item.starts_at).toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Teacher</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="teacherId" required>
                    <option value="">Select</option>
                    {data.teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Student</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId" required>
                    <option value="">Select</option>
                    {data.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <input
                className="h-11 w-full rounded-2xl border border-slate-200 px-4"
                name="title"
                placeholder="Memorize Surah Al-Fatiha ayah 1-3"
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

          <SectionCard title="Lesson Progress">
            <form action="/api/admin/progress" method="post" className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Student</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="studentId" required>
                  <option value="">Select student</option>
                  {data.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Teacher</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="teacherId" required>
                    <option value="">Select</option>
                    {data.teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Course</span>
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="courseId" required>
                    <option value="">Select</option>
                    {data.courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <input
                className="h-11 w-full rounded-2xl border border-slate-200 px-4"
                name="milestone"
                placeholder="Completed makharij basics"
                required
              />
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
              <textarea
                className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                name="notes"
                placeholder="Strengths, next target, revision notes"
              />
              <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                Save Progress
              </button>
            </form>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Courses">
            <div className="space-y-3">
              {data.courses.slice(0, 8).map((course) => (
                <div key={course.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{course.title}</p>
                      <p className="text-sm text-slate-600">{course.level ?? "Level not set"}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
              {!data.courses.length ? <p className="text-sm text-slate-500">No courses yet.</p> : null}
            </div>
          </SectionCard>
          <SectionCard title="Scheduled Classes">
            <div className="space-y-3">
              {data.classSessions.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{item.course_title}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(item.starts_at).toLocaleString()} . {item.teacher_name}
                        {item.student_name ? ` . ${item.student_name}` : ""}
                      </p>
                    </div>
                    {item.meeting_url ? <Video className="h-5 w-5 text-emerald-700" /> : null}
                  </div>
                </div>
              ))}
              {!data.classSessions.length ? <p className="text-sm text-slate-500">No classes scheduled yet.</p> : null}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Recent Attendance">
            <div className="space-y-3">
              {data.attendance.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.student_name}</p>
                  <p className="text-sm text-slate-600">{item.class_title}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {item.status} {item.marked_by_name ? `. ${item.marked_by_name}` : ""}
                  </p>
                </div>
              ))}
              {!data.attendance.length ? <p className="text-sm text-slate-500">No attendance marked yet.</p> : null}
            </div>
          </SectionCard>
          <SectionCard title="Recent Homework">
            <div className="space-y-3">
              {data.homework.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.title}</p>
                  <p className="text-sm text-slate-600">
                    {item.student_name} {item.due_at ? `. Due ${new Date(item.due_at).toLocaleString()}` : ""}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{item.status}</p>
                  {item.feedback ? (
                    <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">Feedback: {item.feedback}</p>
                  ) : null}
                  {item.status === "completed" ? (
                    <form action="/api/admin/homework-review" method="post" className="mt-4 space-y-3">
                      <input type="hidden" name="homeworkId" value={item.id} />
                      <textarea
                        className="min-h-20 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:ring-4 focus:ring-emerald-900/10"
                        name="feedback"
                        placeholder="Review feedback"
                      />
                      <button className="h-10 rounded-full bg-emerald-900 px-4 text-sm font-bold text-white">
                        Mark Reviewed
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
              {!data.homework.length ? <p className="text-sm text-slate-500">No homework assigned yet.</p> : null}
            </div>
          </SectionCard>
          <SectionCard title="Recent Progress">
            <div className="space-y-3">
              {data.progress.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{item.milestone}</p>
                      <p className="text-sm text-slate-600">
                        {item.student_name} . {item.course_title}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                      {item.completion_percent}%
                    </span>
                  </div>
                </div>
              ))}
              {!data.progress.length ? <p className="text-sm text-slate-500">No lesson progress yet.</p> : null}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard title="Security Tools">
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <LockKeyhole className="mt-0.5 h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-bold text-slate-950">Password reset</p>
                <p className="text-sm text-slate-600">
                  Setup links now live in the Onboarding Center. Use this only when an active user needs a manual
                  password reset.
                </p>
              </div>
            </div>
            <form action="/api/admin/password-reset" method="post" className="grid gap-4 lg:grid-cols-4">
              <label className="block lg:col-span-2">
                <span className="text-sm font-bold text-slate-700">User</span>
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="userId" required>
                  <option value="">Select user</option>
                  {data.resetUsers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.role} - {item.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">New password</span>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name="password"
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
              <div className="flex items-end lg:col-start-4">
                <button className="h-11 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                  Reset Password
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
