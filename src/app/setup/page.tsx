import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const db = await getDb();
  const admin = await db
    .prepare("SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1")
    .first<{ id: string }>();
  const params = await searchParams;

  if (admin) {
    redirect("/login");
  }

  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <ShieldCheck className="h-10 w-10 text-amber-300" />
          <h1 className="mt-6 text-4xl font-black">Create First Admin</h1>
          <p className="mt-4 leading-7 text-white/75">
            This one-time setup creates the first administrator account. After an admin exists, this page automatically
            closes and redirects to login.
          </p>
        </div>
        <form action="/api/setup" method="post" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
          <CsrfField />
          {params.error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {params.error === "token"
                ? "Invalid setup token."
                : params.error === "password"
                  ? "Password must be at least 10 characters."
                  : "Please complete all required fields."}
            </div>
          ) : null}
          {[
            ["name", "Full name", "text"],
            ["email", "Email address", "email"],
            ["password", "Password", "password"],
            ["setupToken", "Private setup token", "password"],
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
          <button className="mt-2 h-12 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
            Create Admin
          </button>
        </form>
      </section>
    </main>
  );
}
