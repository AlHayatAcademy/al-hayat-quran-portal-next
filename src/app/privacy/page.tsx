import { SiteFooter, SiteHeader } from "@/components/site-shell";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-emerald-50/40">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Privacy</p>
              <h1 className="text-4xl font-bold text-emerald-950">Privacy Policy</h1>
              <p className="text-base leading-7 text-slate-700">
                Al-Hayat Quran Learning Portal uses account and learning information to operate Quran classes,
                communicate with families and teachers, and support student progress.
              </p>
            </div>

            <div className="space-y-6 rounded-lg border border-emerald-950/10 bg-white p-6 text-slate-700 shadow-sm">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Information We Collect</h2>
                <p>
                  We collect information provided during registration, applications, invitations, and setup. This can
                  include names, email addresses, phone numbers, account roles, parent and student relationships,
                  teacher profile details, class assignments, homework, attendance, progress notes, support messages,
                  and payment status records when used by the academy.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">How We Use Information</h2>
                <p>
                  We use portal data to create and manage accounts, schedule classes, record homework and attendance,
                  track learning progress, review teacher applications, help administrators support families, and send
                  service-related email communications such as setup links, invitations, class updates, and account
                  notices.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Access and Care</h2>
                <p>
                  Portal access is role-based for administrators, teachers, parents, and students. We aim to keep
                  student, parent, and teacher records accurate, limited to academy needs, and protected through
                  practical security controls.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-emerald-950">Contact</h2>
                <p>
                  For questions about privacy, account details, or student records, contact Al-Hayat Quran through the
                  academy contact channel used for your enrollment or at learn-quran.drimranhayat.com.
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
