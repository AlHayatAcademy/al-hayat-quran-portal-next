import { BookOpenCheck, UsersRound } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";
import { courses } from "@/lib/portal-data";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string; course?: string }>;
}) {
  const params = await searchParams;
  const selectedCourse = params.course && courses.includes(params.course) ? params.course : courses[0];

  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <UsersRound className="h-10 w-10 text-amber-300" />
          <h1 className="mt-6 text-4xl font-black">Student & Parent Registration</h1>
          <p className="mt-4 leading-7 text-white/75">
            Families can create a parent account and child profile in one professional onboarding flow. Admin can then
            assign a teacher, class schedule, and live meeting link.
          </p>
          <div className="mt-8 rounded-3xl bg-white/10 p-5">
            <BookOpenCheck className="h-6 w-6 text-amber-300" />
            <p className="mt-3 text-sm font-bold">Parent account + child learning profile</p>
          </div>
        </div>
        <form
          action="/api/register"
          method="post"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10"
        >
          <CsrfField />
          {params.status === "registered" ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              Registration completed. Please login with the parent email and password.
            </div>
          ) : null}
          {params.error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Please complete all required fields. Password must be at least 10 characters.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["parentName", "Parent full name", "text"],
              ["parentEmail", "Parent email", "email"],
              ["phone", "Phone / WhatsApp", "text"],
              ["password", "Create password", "password"],
              ["studentName", "Student full name", "text"],
              ["studentAge", "Student age", "number"],
            ].map(([name, label, type]) => (
              <label key={name} className="block">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  name={name}
                  type={type}
                  required
                />
              </label>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Preferred course</span>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
              name="courseTitle"
              defaultValue={selectedCourse}
              required
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Learning goal</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
              name="learningGoal"
              placeholder="Example: improve Tajweed, start Noorani Qaida, Hifz revision..."
            />
          </label>
          <button className="mt-6 h-12 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
            Create Parent Account
          </button>
        </form>
      </section>
    </main>
  );
}
