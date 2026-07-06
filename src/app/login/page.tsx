import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-shell";

export default function LoginPage() {
  return (
    <main className="academy-surface min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Secure Access</p>
          <h1 className="mt-3 text-4xl font-black text-emerald-950">Login to your academy portal</h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-700">
            Admins, teachers, students, and parents use one clean entry point. Authentication will be connected to
            Cloudflare D1 in the production build.
          </p>
        </div>
        <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-950/10">
          <label className="text-sm font-bold text-slate-700">Email address</label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
            <Mail className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none" placeholder="admin@alhayatquran.com" />
          </div>
          <label className="mt-5 block text-sm font-bold text-slate-700">Password</label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none" placeholder="Password" type="password" />
          </div>
          <Link
            href="/dashboard"
            className="mt-6 flex h-12 items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-white hover:bg-emerald-800"
          >
            View Demo Dashboard
          </Link>
          <Link href="/admin" className="mt-3 flex h-12 items-center justify-center rounded-full border border-emerald-900/20 text-sm font-bold text-emerald-950">
            View Admin Demo
          </Link>
        </form>
      </section>
    </main>
  );
}
