import { KeyRound } from "lucide-react";
import { CsrfField } from "@/components/csrf-field";
import { SiteHeader } from "@/components/site-shell";
import { hashToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type InviteLookup = {
  user_name: string;
  user_email: string;
  role: string;
  expires_at: string;
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = String(params.token ?? "").trim();
  let invite: InviteLookup | null = null;

  if (token) {
    const db = await getDb();
    invite = await db
      .prepare(
        `SELECT users.name AS user_name, users.email AS user_email, users.role, invitation_tokens.expires_at
         FROM invitation_tokens
         INNER JOIN users ON users.id = invitation_tokens.user_id
         WHERE invitation_tokens.token_hash = ?
           AND invitation_tokens.used_at IS NULL
           AND invitation_tokens.expires_at > ?
           AND users.status = 'active'
           AND users.deleted_at IS NULL
         LIMIT 1`,
      )
      .bind(await hashToken(token), new Date().toISOString())
      .first<InviteLookup>();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-950 p-8 text-white shadow-xl">
          <KeyRound className="h-10 w-10 text-amber-300" />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Account setup</p>
          <h1 className="mt-3 text-4xl font-black">Create your portal password</h1>
          <p className="mt-3 text-white/75">Use your secure one-time setup link to activate login access.</p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {!invite ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              This setup link is invalid, expired, or already used. Please ask admin for a new setup link.
            </div>
          ) : (
            <>
              {params.error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  Passwords must match and be at least 8 characters.
                </div>
              ) : null}
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{invite.user_name}</p>
                <p className="text-sm text-slate-600">
                  {invite.user_email} . {invite.role}
                </p>
              </div>
              <form action="/api/invite" method="post" className="mt-6 space-y-4">
                <CsrfField />
                <input type="hidden" name="token" value={token} />
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">New password</span>
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Confirm password</span>
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-emerald-900/10"
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                  />
                </label>
                <button className="h-12 w-full rounded-full bg-emerald-900 text-sm font-bold text-white">
                  Set Password
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
