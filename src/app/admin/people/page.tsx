import { AdminNav } from "@/components/admin-nav";
import { CsrfField } from "@/components/csrf-field";
import { requireRole } from "@/lib/auth";
import { getAdminPeopleData } from "@/lib/academy";
import { Mail, Search } from "lucide-react";

export const dynamic = "force-dynamic";

function StatusBadge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "emerald" | "amber" | "red" | "sky" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-700",
    sky: "bg-sky-100 text-sky-800",
    slate: "bg-slate-100 text-slate-700",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function inviteBadge(status: string) {
  if (status === "used") return <StatusBadge tone="emerald">Password created</StatusBadge>;
  if (status === "sent") return <StatusBadge tone="sky">Setup sent</StatusBadge>;
  if (status === "expired") return <StatusBadge tone="red">Expired</StatusBadge>;
  return <StatusBadge tone="amber">Setup needed</StatusBadge>;
}

function inviteActionLabel(status: string) {
  if (status === "sent") return "Resend setup link";
  if (status === "expired") return "Send new setup link";
  return "Send setup link";
}

function SetupLinkForm({ userId, status }: { userId: string; status: string }) {
  if (status === "used") {
    return <span className="text-xs font-semibold text-slate-500">No setup action needed</span>;
  }

  return (
    <form action="/api/admin/invitations" method="post">
      <CsrfField />
      <input type="hidden" name="userId" value={userId} />
      <button className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-emerald-950">
        <Mail className="h-4 w-4" />
        {inviteActionLabel(status)}
      </button>
    </form>
  );
}

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; setup?: string; q?: string }>;
}) {
  const user = await requireRole("admin");
  const params = await searchParams;
  const role = params.role ?? "all";
  const setup = params.setup ?? "all";
  const q = params.q ?? "";
  const data = await getAdminPeopleData({ role, setup, q });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Admin</p>
          <h1 className="text-4xl font-black tracking-tight text-emerald-950">People directory</h1>
          <p className="max-w-3xl text-slate-600">
            Signed in as {user.name}. Search and manage students, parents, and teachers without crowding the dashboard.
          </p>
        </div>
        <AdminNav active="people" />

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-4 lg:grid-cols-[1fr_12rem_12rem_auto]" action="/admin/people">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Search</span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  name="q"
                  placeholder="Name, email, parent, teacher, course"
                  defaultValue={q}
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Role</span>
              <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="role" defaultValue={role}>
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
                <option value="teacher">Teachers</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Setup</span>
              <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4" name="setup" defaultValue={setup}>
                <option value="all">All statuses</option>
                <option value="needs_setup">Needs setup</option>
                <option value="setup_sent">Setup sent</option>
                <option value="login_ready">Login ready</option>
              </select>
            </label>
            <div className="flex items-end">
              <button className="h-11 w-full rounded-full bg-emerald-900 px-5 text-sm font-bold text-white">
                Apply
              </button>
            </div>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Showing</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{data.totals.shown}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Students</p>
              <p className="mt-1 text-2xl font-black text-emerald-950">{data.totals.students}</p>
            </div>
            <div className="rounded-xl bg-sky-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Parents</p>
              <p className="mt-1 text-2xl font-black text-sky-950">{data.totals.parents}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Teachers</p>
              <p className="mt-1 text-2xl font-black text-amber-950">{data.totals.teachers}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {data.people.map((person) => (
              <div key={person.id} className="rounded-xl bg-slate-50 p-4">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto] xl:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">{person.name}</p>
                      <StatusBadge>{person.role}</StatusBadge>
                      {inviteBadge(person.invitation_status)}
                      {person.active_sessions > 0 ? <StatusBadge tone="emerald">Active session</StatusBadge> : null}
                    </div>
                    <p className="mt-1 break-all text-sm text-slate-600">{person.email}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    {person.role === "student" ? (
                      <>
                        <p>Parent: {person.parent_name ?? "Unassigned"}</p>
                        <p>Teacher: {person.teacher_name ?? "Unassigned"}</p>
                        <p>
                          Course: {person.course_title ?? "Course needed"} . {person.scheduled_classes} class
                        </p>
                      </>
                    ) : (
                      <p>{person.status}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <SetupLinkForm userId={person.id} status={person.invitation_status} />
                    <a
                      href={`/admin#${person.role === "student" ? "assign-student" : "security-tools"}`}
                      className="inline-flex items-center rounded-full border border-emerald-900/20 bg-white px-4 py-2 text-xs font-bold text-emerald-950"
                    >
                      {person.role === "student" ? "Assign" : "Password reset"}
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {!data.people.length ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No people match these filters.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
