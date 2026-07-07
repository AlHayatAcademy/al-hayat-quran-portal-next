import { KeyRound } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = String(params.token ?? "").trim();

  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          action="/api/auth/reset-password/verify"
          method="post"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10"
        >
          <CsrfField />
          <input type="hidden" name="token" value={token} />
          <KeyRound className="h-10 w-10 text-amber-600" />
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Password Reset</p>
          <h1 className="mt-3 text-3xl font-black text-emerald-950">Create a new password</h1>
          {params.error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              This reset link is invalid or the passwords do not match.
            </div>
          ) : null}
          <label className="mt-5 block text-sm font-bold text-slate-700">New password</label>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
            name="password"
            type="password"
            minLength={8}
            required
          />
          <label className="mt-5 block text-sm font-bold text-slate-700">Confirm password</label>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
          />
          <button className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-white hover:bg-emerald-800">
            Reset Password
          </button>
        </form>
      </section>
    </main>
  );
}
