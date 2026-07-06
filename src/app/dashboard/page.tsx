import Link from "next/link";
import { CalendarDays, ChartBar, ClipboardList, CreditCard, Users, Video } from "lucide-react";
import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/academy";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user);
  const metrics = [
    { title: "Role", value: user.role, icon: Users, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Classes", value: String(data.classes.length), icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
    { title: "Homework", value: String(data.homework.length), icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
    { title: "Progress Items", value: String(data.progress.length), icon: ChartBar, tone: "bg-cyan-50 text-cyan-700" },
    { title: "Payments", value: String(data.payments.length), icon: CreditCard, tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">{user.role} dashboard</p>
          <h1 className="mt-3 text-4xl font-black">Welcome, {user.name}</h1>
          <p className="mt-3 max-w-3xl text-white/75">
            This workspace is reading your role, classes, homework, progress, payments, and announcements from
            Cloudflare D1.
          </p>
          <form action="/api/auth/logout" method="post" className="mt-5">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-950">Logout</button>
          </form>
        </div>

        <h2 className="mt-8 text-2xl font-black text-emerald-950">Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Classes">
            <div className="space-y-3">
              {data.classes.length ? data.classes.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.course_title}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(item.starts_at).toLocaleString()} . {item.teacher_name}
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
                    {item.student_name} {item.due_at ? `. Due: ${new Date(item.due_at).toLocaleDateString()}` : ""}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{item.status}</p>
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
      </div>
    </main>
  );
}
