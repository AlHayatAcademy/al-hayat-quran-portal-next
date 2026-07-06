import { SiteHeader } from "@/components/site-shell";
import { MetricCard, SectionCard } from "@/components/dashboard-widgets";
import { applications, modules, schedule } from "@/lib/portal-data";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Admin</p>
          <h1 className="text-4xl font-black tracking-tight text-emerald-950">Academy control center</h1>
          <p className="max-w-3xl text-slate-600">
            Manage teachers, students, parents, courses, classes, attendance, lesson progress, homework, payments,
            support tickets, announcements, and teacher approvals.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.slice(0, 12).map((module) => (
            <MetricCard key={module.title} {...module} />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Teacher Applications">
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{application.name}</p>
                      <p className="text-sm text-slate-600">{application.subject} . {application.experience}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Today Classes">
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={`${item.time}-${item.student}`} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{item.time} . {item.course}</p>
                  <p className="text-sm text-slate-600">{item.student} with {item.teacher}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-700">{item.link}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
