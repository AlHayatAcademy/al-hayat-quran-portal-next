import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, ShieldCheck, Video } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { courses, roleCards } from "@/lib/portal-data";

export default function Home() {
  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="w-fit rounded-full border border-amber-300/60 bg-white px-4 py-2 text-sm font-bold text-emerald-900">
            Premium online Quran academy
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-emerald-950 sm:text-6xl">
            Al-Hayat Quran Learning Portal
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            A modern learning portal for Quran classes, teacher approvals, attendance, homework, progress, payments,
            support, and parent visibility.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              Open Portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 text-sm font-bold text-emerald-950"
            >
              Apply as Teacher
            </Link>
          </div>
        </div>
        <div className="navy-panel rounded-[2rem] p-6 text-white shadow-2xl shadow-emerald-950/20">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Live classes", "Manual Zoom/Jitsi/Meet links", Video],
              ["Smart schedules", "Teacher and student timetables", CalendarDays],
              ["Quality tracking", "Attendance and lesson progress", CheckCircle2],
              ["Admin approval", "Teacher application workflow", ShieldCheck],
            ].map(([title, text, Icon]) => (
              <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <Icon className="h-7 w-7 text-amber-300" />
                <h3 className="mt-5 text-lg font-bold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{text as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-white p-5 text-emerald-950">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Today</p>
            <p className="mt-3 text-3xl font-black">42 live classes</p>
            <p className="mt-2 text-sm text-slate-600">Designed for students, parents, teachers, and admin teams.</p>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Courses</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-950">Complete Quran academy catalog</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {courses.map((course) => (
            <div key={course} className="rounded-2xl border border-emerald-950/10 bg-white p-4 font-bold text-emerald-950 shadow-sm">
              {course}
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {roleCards.map((card) => (
            <div key={card.role} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">{card.role}</p>
              <h3 className="mt-3 text-xl font-black text-emerald-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.copy}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
