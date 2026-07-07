import { SiteFooter, SiteHeader } from "@/components/site-shell";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-emerald-50/40">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Terms</p>
              <h1 className="text-4xl font-bold text-emerald-950">Terms of Use</h1>
              <p className="text-base leading-7 text-slate-700">
                These terms describe expected use of the Al-Hayat Quran Learning Portal for students, parents,
                teachers, and administrators.
              </p>
            </div>

            <div className="space-y-6 rounded-lg border border-emerald-950/10 bg-white p-6 text-slate-700 shadow-sm">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Portal Accounts</h2>
                <p>
                  Accounts are intended for enrolled families, approved teachers, and academy administrators. Keep login
                  details private, use accurate account information, and notify the academy if access should be changed
                  or removed.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Learning Records</h2>
                <p>
                  The portal may store student, parent, and teacher data, including class schedules, attendance,
                  homework, progress records, teacher application details, support notes, and service-related email
                  communications. These records support Quran learning and academy administration.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Responsible Use</h2>
                <p>
                  Use the portal respectfully and only for academy-related learning and administration. Do not attempt
                  to access another person&apos;s account, disrupt the service, or upload content that is harmful,
                  misleading, or unrelated to class activity.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Contact</h2>
                <p>
                  For questions about these terms, account access, class records, or portal use, contact Al-Hayat Quran
                  through the academy contact channel used for your enrollment or at learn-quran.drimranhayat.com.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
