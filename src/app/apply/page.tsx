import { GraduationCap, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-shell";

export default function ApplyPage() {
  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <GraduationCap className="h-10 w-10 text-amber-300" />
          <h1 className="mt-6 text-4xl font-black">Teacher Application</h1>
          <p className="mt-4 leading-7 text-white/75">
            Applicants submit their Quran teaching profile publicly. Admin reviews, approves, rejects, or schedules an
            interview before granting teacher dashboard access.
          </p>
          <div className="mt-8 rounded-3xl bg-white/10 p-5">
            <ShieldCheck className="h-6 w-6 text-amber-300" />
            <p className="mt-3 text-sm font-bold">Approval protected workflow</p>
          </div>
        </div>
        <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10">
          {["Full name", "Email address", "Phone / WhatsApp", "Teaching specialty", "Years of experience"].map((field) => (
            <label key={field} className="mb-4 block">
              <span className="text-sm font-bold text-slate-700">{field}</span>
              <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Short teaching bio</span>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10" />
          </label>
          <button className="mt-6 h-12 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
            Submit Application
          </button>
        </form>
      </section>
    </main>
  );
}
