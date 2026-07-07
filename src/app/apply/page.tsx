import { GraduationCap, ShieldCheck } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const params = await searchParams;

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
        <form
          action="/api/teacher-applications"
          method="post"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10"
        >
          <CsrfField />
          {params.status === "submitted" ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              Application submitted. Admin will review and contact you.
            </div>
          ) : null}
          {params.error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Please complete all required fields.
            </div>
          ) : null}
          {[
            ["name", "Full name", "text"],
            ["email", "Email address", "email"],
            ["phone", "Phone / WhatsApp", "text"],
            ["specialty", "Teaching specialty", "text"],
            ["experienceYears", "Years of experience", "number"],
          ].map(([name, label, type]) => (
            <label key={name} className="mb-4 block">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                name={name}
                type={type}
                required
              />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Short teaching bio</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
              name="bio"
              required
            />
          </label>
          <button className="mt-6 h-12 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
            Submit Application
          </button>
        </form>
      </section>
    </main>
  );
}
