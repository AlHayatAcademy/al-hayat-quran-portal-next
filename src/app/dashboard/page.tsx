import Link from "next/link";
import { BookOpen, CalendarDays, ChartBar, CheckCircle2, ClipboardList, CreditCard, Users, Video } from "lucide-react";
import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import { homework, schedule } from "@/lib/portal-data";

const teacherMetrics = [
  { title: "Assigned Students", value: "18", icon: Users, tone: "bg-emerald-50 text-emerald-700" },
  { title: "Classes Today", value: "6", icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
  { title: "Attendance Marked", value: "92%", icon: CheckCircle2, tone: "bg-lime-50 text-lime-700" },
  { title: "Homework Queue", value: "11", icon: ClipboardList, tone: "bg-orange-50 text-orange-700" },
];

const studentMetrics = [
  { title: "Current Course", value: "Nazra", icon: BookOpen, tone: "bg-sky-50 text-sky-700" },
  { title: "Attendance", value: "96%", icon: CheckCircle2, tone: "bg-lime-50 text-lime-700" },
  { title: "Progress", value: "68%", icon: ChartBar, tone: "bg-cyan-50 text-cyan-700" },
  { title: "Payments", value: "Clear", icon: CreditCard, tone: "bg-rose-50 text-rose-700" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Role Dashboards</p>
          <h1 className="mt-3 text-4xl font-black">Teacher, Student, and Parent workspace</h1>
          <p className="mt-3 max-w-3xl text-white/75">
            This Next.js version is designed to connect to Cloudflare D1 for real accounts, roles, and academy records.
          </p>
        </div>

        <h2 className="mt-8 text-2xl font-black text-emerald-950">Teacher Dashboard</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teacherMetrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Student Dashboard">
            <div className="grid gap-4 sm:grid-cols-2">
              {studentMetrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
            </div>
            <Link href="#" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-emerald-900 px-5 text-sm font-bold text-white">
              <Video className="h-4 w-4" /> Join Class
            </Link>
          </SectionCard>

          <SectionCard title="Parent Dashboard">
            <div className="space-y-3">
              {schedule.slice(0, 2).map((item) => (
                <div key={item.student} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.student}</p>
                  <p className="text-sm text-slate-600">{item.course} . {item.time} . {item.teacher}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard title="Homework and Lesson Progress">
            <div className="grid gap-3 md:grid-cols-3">
              {homework.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">Due: {item.due}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{item.status}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
