import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap, Headphones, ShieldCheck, Users, Video } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/academy";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const user = await requireRole("admin");
  const data = await getAdminData();
  const params = await searchParams;
  const metrics = [
    { title: "Students", value: String(data.counts.students ?? 0), icon: Users, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Teachers", value: String(data.counts.teachers ?? 0), icon: GraduationCap, tone: "bg-amber-50 text-amber-700" },
    { title: "Courses", value: String(data.counts.courses ?? 0), icon: BookOpen, tone: "bg-sky-50 text-sky-700" },
    { title: "Classes", value: String(data.counts.classes ?? 0), icon: CalendarDays, tone: "bg-violet-50 text-violet-700" },
    { title: "Homework", value: String(data.counts.homework ?? 0), icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
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
            <form action="/api/admin/assignments" method="post" className="space-y-4">
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Teacher Applications">
            <div className="space-y-3">
              {data.applications.length ? data.applications.map((application) => (
                <div key={application.email} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{application.name}</p>
                      <p className="text-sm text-slate-600">
                        {application.specialty ?? "Specialty pending"} . {application.experience_years ?? 0} years
                      </p>
                      <p className="text-xs text-slate-500">{application.email}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {application.status}
                    </span>
                  </div>
                  {application.status === "pending" ? (
                    <div className="mt-4 flex gap-2">
                      <form action="/api/admin/teacher-applications" method="post">
                        <input type="hidden" name="email" value={application.email} />
                        <input type="hidden" name="action" value="approve" />
                        <button className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-bold text-white">
                          Approve
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
              )) : <p className="text-sm text-slate-500">No teacher applications yet.</p>}
            </div>
          </SectionCard>
          <SectionCard title="Family Registrations">
            <div className="space-y-3">
              {data.families.length ? data.families.map((item) => (
                <div key={`${item.parent_email}-${item.student_name}`} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.student_name}</p>
                  <p className="text-sm text-slate-600">
                    Parent: {item.parent_name ?? "Unassigned"} . {item.parent_email ?? "No email"}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {item.course_title ?? "Course pending"}
                  </p>
                </div>
              )) : <p className="text-sm text-slate-500">No family registrations yet.</p>}
            </div>
          </SectionCard>
        </div>
        <div className="mt-8">
          <SectionCard title="Recent Users">
            <div className="grid gap-3 md:grid-cols-2">
              {data.users.map((item) => (
                <div key={item.email} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.email}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {item.role} . {item.status}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
