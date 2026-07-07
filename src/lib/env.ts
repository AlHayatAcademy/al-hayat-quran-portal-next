import { logger } from "@/lib/utils/logger";

export type CloudflareD1Env = {
  DB: D1Database;
  SETUP_TOKEN?: string;
  APP_URL?: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
};

type EnvValidationResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
};

export function validateEnv(env: Partial<CloudflareD1Env>, options: { requireSetupToken?: boolean } = {}): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!env.DB) {
    missing.push("DB");
  }

  if (options.requireSetupToken && !env.SETUP_TOKEN) {
    missing.push("SETUP_TOKEN");
  }

  if (!env.APP_URL) {
    warnings.push("APP_URL is not configured; request origin will be used for generated links.");
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    warnings.push("Email delivery is not fully configured; setup/reset links may need manual delivery.");
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

export function assertEnv(env: Partial<CloudflareD1Env>, options: { requireSetupToken?: boolean } = {}): asserts env is CloudflareD1Env {
  const result = validateEnv(env, options);

  if (!result.ok) {
    logger.error("Environment validation failed", undefined, { missing: result.missing });
    throw new Error(`Missing required environment binding(s): ${result.missing.join(", ")}`);
  }

  for (const warning of result.warnings) {
    logger.warn("Environment validation warning", { warning });
  }
}
