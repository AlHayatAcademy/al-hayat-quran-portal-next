import { getCloudflareEnv } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

type SetupEmailInput = {
  to: string;
  name: string;
  role: string;
  setupUrl: string;
};

type ResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
};

type VerificationEmailInput = {
  to: string;
  name: string;
  verifyUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendPasswordSetupEmail({ to, name, role, setupUrl }: SetupEmailInput) {
  const env = await getCloudflareEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn("Password setup email skipped because email is not configured", { to, role });
    return { sent: false, reason: "email-not-configured" };
  }

  const safeName = escapeHtml(name);
  const safeRole = escapeHtml(role);
  const safeSetupUrl = escapeHtml(setupUrl);

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
          <p>Assalamu alaikum ${safeName},</p>
          <p>Your <strong>${safeRole}</strong> account for Al-Hayat Quran Learning Portal is ready.</p>
          <p>
            <a href="${safeSetupUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
              Create Password
            </a>
          </p>
          <p>This link expires in 7 days and can be used only once.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    logger.error("Password setup email provider failed", undefined, { status: response.status, to, role });
    return { sent: false, reason: "email-provider-error" };
  }

  logger.info("Password setup email sent", { to, role });
  return { sent: true, reason: "sent" };
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: ResetEmailInput) {
  const env = await getCloudflareEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn("Password reset email skipped because email is not configured", { to });
    return { sent: false, reason: "email-not-configured" };
  }

  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtml(resetUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject: "Reset your Al-Hayat Quran portal password",
      text: [
        `Assalamu alaikum ${name},`,
        "",
        "Use this secure one-time link to reset your Al-Hayat Quran Learning Portal password:",
        resetUrl,
        "",
        "This link expires in 24 hours and can be used only once.",
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>Reset your Al-Hayat Quran portal password</h2>
          <p>Assalamu alaikum ${safeName},</p>
          <p>Use this secure one-time link to reset your password.</p>
          <p>
            <a href="${safeResetUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
              Reset Password
            </a>
          </p>
          <p>This link expires in 24 hours and can be used only once.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    logger.error("Password reset email provider failed", undefined, { status: response.status, to });
    return { sent: false, reason: "email-provider-error" };
  }

  logger.info("Password reset email sent", { to });
  return { sent: true, reason: "sent" };
}

export async function sendEmailVerificationEmail({ to, name, verifyUrl }: VerificationEmailInput) {
  const env = await getCloudflareEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn("Email verification skipped because email is not configured", { to });
    return { sent: false, reason: "email-not-configured" };
  }

  const safeName = escapeHtml(name);
  const safeVerifyUrl = escapeHtml(verifyUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject: "Verify your Al-Hayat Quran portal email",
      text: [
        `Assalamu alaikum ${name},`,
        "",
        "Please verify your email address for Al-Hayat Quran Learning Portal:",
        verifyUrl,
        "",
        "This link expires in 7 days and can be used only once.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>Verify your Al-Hayat Quran portal email</h2>
          <p>Assalamu alaikum ${safeName},</p>
          <p>Please verify your email address for Al-Hayat Quran Learning Portal.</p>
          <p>
            <a href="${safeVerifyUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
              Verify Email
            </a>
          </p>
          <p>This link expires in 7 days and can be used only once.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    logger.error("Email verification provider failed", undefined, { status: response.status, to });
    return { sent: false, reason: "email-provider-error" };
  }

  logger.info("Email verification sent", { to });
  return { sent: true, reason: "sent" };
}
