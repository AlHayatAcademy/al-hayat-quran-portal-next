import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Secure Access</p>
          <h1 className="mt-3 text-4xl font-black text-emerald-950">Login to your academy portal</h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-700">
            Admins, teachers, students, and parents use one secure D1-backed entry point.
          </p>
        </div>
        <form
          action="/api/auth/login"
          method="post"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10"
        >
          <CsrfField />
          {params.error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {params.error === "missing"
                ? "Please enter your email and password."
                : "Login failed. Check your email, password, and account status."}
            </div>
          ) : null}
          <label className="text-sm font-bold text-slate-700">Email address</label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
            <Mail className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none" name="email" placeholder="you@example.com" type="email" required />
          </div>
          <label className="mt-5 block text-sm font-bold text-slate-700">Password</label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none" name="password" placeholder="Password" type="password" required />
          </div>
          <button className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-white hover:bg-emerald-800">
            Sign in
          </button>
          <Link href="/forgot-password" className="mt-4 block text-center text-sm font-bold text-emerald-900">
            Forgot password?
          </Link>
        </form>
      </section>
    </main>
  );
}
