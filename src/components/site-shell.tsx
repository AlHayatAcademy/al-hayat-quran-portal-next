import Link from "next/link";
import { BookOpen, Globe2, LogIn } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold text-emerald-950">Al-Hayat Quran</span>
            <span className="block text-xs font-medium text-emerald-800/70">Learning Portal</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
          <Link href="/#courses">Courses</Link>
          <Link href="/#roles">Portals</Link>
          <Link href="/apply">Teacher Apply</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden h-10 items-center gap-2 rounded-full border border-emerald-900/15 px-4 text-sm font-semibold text-emerald-950 sm:flex">
            <Globe2 className="h-4 w-4" />
            EN / اردو
          </button>
          <Link
            href="/login"
            className="flex h-10 items-center gap-2 rounded-full bg-emerald-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-950/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>Al-Hayat Quran Learning Portal. Built for Cloudflare deployment.</p>
        <p>learn-quran.drimranhayat.com</p>
      </div>
    </footer>
  );
}
