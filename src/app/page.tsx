import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { courses, roleCards } from "@/lib/portal-data";

export default function Home() {
  const stats = [
    { value: "1:1", label: "Private live Quran classes" },
    { value: "24/7", label: "Global family scheduling" },
    { value: "10+", label: "Structured learning tracks" },
    { value: "100%", label: "Parent-visible progress" },
  ];
  const learningSteps = [
    {
      title: "Choose a learning path",
      copy: "Start with Qaida, Nazra, Tajweed, Hifz, duas, Arabic, or revision. Every student begins with a clear goal.",
      icon: BookOpen,
    },
    {
      title: "Get matched with care",
      copy: "Admin reviews the profile, assigns a suitable teacher, and schedules classes around your family's routine.",
      icon: Users,
    },
    {
      title: "Learn with full visibility",
      copy: "Students join live sessions while parents can follow attendance, homework, feedback, and milestone progress.",
      icon: CheckCircle2,
    },
  ];
  const classroomFeatures = [
    "Teacher-led live recitation",
    "Homework and feedback loop",
    "Attendance history",
    "Progress milestones",
    "Parent dashboard",
    "Admin quality oversight",
  ];
  const trustCards = [
    {
      title: "For children",
      copy: "Gentle pacing, parent visibility, and short learning goals that make Quran study feel consistent and safe.",
      icon: ShieldCheck,
    },
    {
      title: "For adults",
      copy: "Flexible private sessions for recitation, Tajweed correction, Arabic basics, translation, and revision.",
      icon: Clock3,
    },
    {
      title: "For teachers",
      copy: "A focused workspace for assigned students, classes, attendance, homework review, and lesson progress.",
      icon: GraduationCap,
    },
  ];

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
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              Register Student <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 text-sm font-bold text-emerald-950"
            >
              Apply as Teacher
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 text-sm font-bold text-emerald-950"
            >
              Portal Login
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
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Select a course to start registration with your preferred track already chosen.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {courses.map((course) => (
            <Link
              key={course}
              href={`/register?course=${encodeURIComponent(course)}`}
              className="rounded-2xl border border-emerald-950/10 bg-white p-4 font-bold text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-900/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-900/10"
            >
              {course}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-emerald-950">{item.value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">How it works</p>
          <h2 className="mt-2 text-3xl font-black text-emerald-950">From first lesson to confident recitation</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {learningSteps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-black text-amber-700">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-emerald-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <Sparkles className="h-9 w-9 text-amber-300" />
          <h2 className="mt-5 text-3xl font-black">A complete Quran classroom, not just a video call</h2>
          <p className="mt-4 leading-7 text-white/75">
            Al-Hayat combines live teaching with the operational pieces families usually miss: assignments, attendance,
            teacher feedback, parent oversight, and admin quality checks.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-emerald-950"
          >
            Start Student Registration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {classroomFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="rounded-xl bg-lime-50 p-2 text-lime-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <p className="font-bold text-emerald-950">{feature}</p>
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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {trustCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <card.icon className="h-8 w-8 text-amber-700" />
              <h3 className="mt-5 text-xl font-black text-emerald-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-950 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-amber-300">
              {[0, 1, 2, 3, 4].map((item) => (
                <Star key={item} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black">Built for families who want Quran learning to feel organized, trusted, and personal.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              Begin with a student registration, invite a teacher application, or sign in to manage the academy from one secure portal.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-emerald-950"
            >
              Register Student <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-bold text-white"
            >
              Apply as Teacher <Headphones className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
