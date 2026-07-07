import Link from "next/link";
import { Mail } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          action="/api/auth/password-reset"
          method="post"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10"
        >
          <CsrfField />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Password Reset</p>
          <h1 className="mt-3 text-3xl font-black text-emerald-950">Request a reset link</h1>
          {params.status === "sent" ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              If that email is active, a reset link has been sent.
            </div>
          ) : null}
          <label className="mt-5 block text-sm font-bold text-slate-700">Email address</label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
            <Mail className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none" name="email" placeholder="you@example.com" type="email" required />
          </div>
          <button className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-white hover:bg-emerald-800">
            Send Reset Link
          </button>
          <Link href="/login" className="mt-4 block text-center text-sm font-bold text-emerald-900">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  );
}
