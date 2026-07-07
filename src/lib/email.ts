import { getCloudflareEnv } from "@/lib/db";

type SetupEmailInput = {
  to: string;
  name: string;
  role: string;
  setupUrl: string;
};

export async function sendPasswordSetupEmail({ to, name, role, setupUrl }: SetupEmailInput) {
  const env = await getCloudflareEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return { sent: false, reason: "email-not-configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject: "Your Al-Hayat Quran portal account is ready",
      text: [
        `Assalamu alaikum ${name},`,
        "",
        `Your ${role} account for Al-Hayat Quran Learning Portal is ready.`,
        "Please open this secure one-time link to create your password:",
        setupUrl,
        "",
        "This link expires in 7 days and can be used only once.",
        "",
        "Al-Hayat Quran Learning Portal",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>Your Al-Hayat Quran portal account is ready</h2>
          <p>Assalamu alaikum ${name},</p>
          <p>Your <strong>${role}</strong> account for Al-Hayat Quran Learning Portal is ready.</p>
          <p>
            <a href="${setupUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
              Create Password
            </a>
          </p>
          <p>This link expires in 7 days and can be used only once.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: "email-provider-error" };
  }

  return { sent: true, reason: "sent" };
}
